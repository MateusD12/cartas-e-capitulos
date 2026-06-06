import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

  return NextResponse.json({ status: order.status })
}
