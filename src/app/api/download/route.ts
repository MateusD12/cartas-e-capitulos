import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // Buscar pedido do usuário
  const { data: order, error } = await supabase
    .from('orders')
    .select('status, products(pdf_storage_path)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error || !order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (order.status !== 'paid') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const pdfPath = (order.products as unknown as { pdf_storage_path: string | null } | null)?.pdf_storage_path
  if (!pdfPath) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })

  // Gerar signed URL com 60s de validade
  const admin = createAdminClient()
  const { data: signedData, error: signedError } = await admin.storage
    .from('product-pdfs')
    .createSignedUrl(pdfPath, 60)

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json({ error: 'Erro ao gerar link de download' }, { status: 500 })
  }

  return NextResponse.redirect(signedData.signedUrl, { status: 302 })
}
