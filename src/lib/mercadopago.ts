import MercadoPagoConfig, { Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export const mpPayment = new Payment(client)

export interface PixPaymentResult {
  mpId: number
  qrCode: string
  qrCodeBase64: string
  expiresAt: string
}

export async function createPixPayment(params: {
  amount: number
  description: string
  payerEmail: string
  payerName: string
  payerCpf: string
  orderId: string
}): Promise<PixPaymentResult> {
  const parts = params.payerName.trim().split(' ')
  const firstName = parts[0]
  const lastName = parts.slice(1).join(' ') || firstName
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const result = await mpPayment.create({
    body: {
      transaction_amount: params.amount,
      description: params.description,
      payment_method_id: 'pix',
      payer: {
        email: params.payerEmail,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: 'CPF',
          number: params.payerCpf.replace(/\D/g, ''),
        },
      },
      date_of_expiration: expiresAt,
      external_reference: params.orderId,
    },
  })

  const txData = result.point_of_interaction?.transaction_data

  return {
    mpId: result.id!,
    qrCode: txData?.qr_code ?? '',
    qrCodeBase64: txData?.qr_code_base64 ?? '',
    expiresAt,
  }
}
