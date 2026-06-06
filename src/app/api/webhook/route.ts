import { NextResponse, type NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { mpPayment } from '@/lib/mercadopago'
import { sendPurchaseEmail } from '@/lib/email'

function validateSignature(request: NextRequest, payloadId: string | number, ts: string, v1: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true

  const requestId = request.headers.get('x-request-id') ?? ''
  const manifest  = `id:${payloadId};request-id:${requestId};ts:${ts}`
  const expected  = createHmac('sha256', secret).update(manifest).digest('hex')
  return expected === v1
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const xSignature = request.headers.get('x-signature') ?? ''
    const ts  = xSignature.match(/ts=([^,]+)/)?.[1] ?? ''
    const v1  = xSignature.match(/v1=([^,]+)/)?.[1] ?? ''

    if (body.data?.id && !validateSignature(request, body.data.id, ts, v1)) {
      console.warn('[webhook] Assinatura inválida')
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const paymentId = String(body.data.id)
    const payment   = await mpPayment.get({ id: paymentId })

    if (payment.status === 'approved') {
      const admin = createAdminClient()

      const { data: order } = await admin
        .from('orders')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('mp_payment_id', paymentId)
        .eq('status', 'pending')
        .select('id, download_token, buyer_email, buyer_name, products(name)')
        .single()

      // Enviar email de confirmação
      if (order?.buyer_email) {
        try {
          await sendPurchaseEmail({
            to: order.buyer_email,
            buyerName:     order.buyer_name ?? 'Cliente',
            productName:   (order.products as unknown as { name: string } | null)?.name ?? 'Seu imprimível',
            downloadToken: order.download_token,
            orderId:       order.id,
          })
        } catch (emailErr) {
          console.error('[webhook] Falha ao enviar email:', emailErr)
          // Não interrompe — pagamento já foi aprovado
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
