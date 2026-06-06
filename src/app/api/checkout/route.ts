import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPixPayment } from '@/lib/mercadopago'
import type { CheckoutPayload } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json()
    const { productId, name, email, cpf } = body

    if (!productId || !name || !email || !cpf) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Usuário pode estar logado ou não (guest checkout)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const admin = createAdminClient()

    const { data: product, error: productError } = await admin
      .from('products')
      .select('id, name, price, is_active')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user?.id ?? null,   // null para guests
        product_id: product.id,
        status: 'pending',
        amount: product.price,
        buyer_name: name,
        buyer_email: email,
        buyer_cpf: cpf,
      })
      .select('id, download_token')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
    }

    const pix = await createPixPayment({
      amount: product.price,
      description: product.name,
      payerEmail: email,
      payerName: name,
      payerCpf: cpf,
      orderId: order.id,
    })

    await admin
      .from('orders')
      .update({ mp_payment_id: String(pix.mpId) })
      .eq('id', order.id)

    return NextResponse.json({
      orderId: order.id,
      downloadToken: order.download_token,
      qrCode: pix.qrCode,
      qrCodeBase64: pix.qrCodeBase64,
      expiresAt: pix.expiresAt,
    })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
