import { NextResponse, type NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { mpPayment } from '@/lib/mercadopago'

function validateSignature(request: NextRequest, payloadId: string | number, ts: string, v1: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // skip em dev sem secret

  const requestId = request.headers.get('x-request-id') ?? ''
  const manifest = `id:${payloadId};request-id:${requestId};ts:${ts}`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  return expected === v1
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar assinatura
    const xSignature = request.headers.get('x-signature') ?? ''
    const tsMatch = xSignature.match(/ts=([^,]+)/)
    const v1Match = xSignature.match(/v1=([^,]+)/)
    const ts = tsMatch?.[1] ?? ''
    const v1 = v1Match?.[1] ?? ''

    if (body.data?.id && !validateSignature(request, body.data.id, ts, v1)) {
      console.warn('[webhook] Assinatura inválida')
      return NextResponse.json({ ok: false }, { status: 200 }) // 200 para evitar reenvio
    }

    // Só processar eventos de pagamento
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const paymentId = String(body.data.id)
    const payment = await mpPayment.get({ id: paymentId })

    if (payment.status === 'approved') {
      const admin = createAdminClient()
      const { error } = await admin
        .from('orders')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('mp_payment_id', paymentId)
        .eq('status', 'pending')

      if (error) console.error('[webhook] Erro ao atualizar pedido:', error)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[webhook]', err)
    return NextResponse.json({ ok: false }, { status: 200 }) // sempre 200
  }
}
