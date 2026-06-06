import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const admin = createAdminClient()
  let query = admin.from('orders').select('*, products(name)').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })

  return NextResponse.json(data)
}
