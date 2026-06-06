import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 })

  // Verificar se é admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('status, products(pdf_storage_path)')
    .eq('id', orderId)
    .single()

  if (!order || order.status !== 'paid') {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 404 })
  }

  const pdfPath = (order.products as unknown as { pdf_storage_path: string | null } | null)?.pdf_storage_path
  if (!pdfPath) return NextResponse.json({ error: 'PDF não encontrado' }, { status: 404 })

  const { data: signedData, error } = await admin.storage
    .from('product-pdfs')
    .createSignedUrl(pdfPath, 3600) // 1 hora para admin

  if (error || !signedData) return NextResponse.json({ error: 'Erro ao gerar link' }, { status: 500 })

  return NextResponse.json({ url: signedData.signedUrl })
}
