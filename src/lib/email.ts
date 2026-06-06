import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cartas-e-capitulos.vercel.app'
const FROM    = process.env.EMAIL_FROM ?? 'Cartas & Capítulos <noreply@cartasecapitulos.com.br>'

interface SendPurchaseEmailParams {
  to: string
  buyerName: string
  productName: string
  downloadToken: string
  orderId: string
}

export async function sendPurchaseEmail({
  to,
  buyerName,
  productName,
  downloadToken,
  orderId,
}: SendPurchaseEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY não configurada — email não enviado')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const downloadUrl = `${APP_URL}/api/download?token=${downloadToken}`
  const firstName   = buyerName.split(' ')[0]

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,sans-serif">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#A8D8A8,#AED6F1);padding:32px 32px 24px;text-align:center">
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#1a1a1a">Cartas & Capítulos</h1>
      <p style="margin:6px 0 0;font-size:13px;color:#3d5a3d">Imprimíveis que encantam</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1a1a1a">
        Pagamento confirmado! 🎉
      </h2>
      <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6">
        Olá, <strong>${firstName}</strong>! Seu pedido foi confirmado e o PDF está pronto para download.
      </p>

      <!-- Produto -->
      <div style="background:#f3faf3;border:1px solid #A8D8A8;border-radius:12px;padding:16px;margin-bottom:24px">
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px">Produto</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1a1a1a">${productName}</p>
      </div>

      <!-- Botão download -->
      <a href="${downloadUrl}"
         style="display:block;background:#A8D8A8;color:#1a1a1a;text-decoration:none;text-align:center;font-weight:700;font-size:16px;padding:16px;border-radius:12px;margin-bottom:16px">
        ⬇️ Baixar meu PDF agora
      </a>

      <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;text-align:center">
        Link com validade de uso único. Acesse "Meus Pedidos" para baixar novamente quando quiser.
      </p>

      <!-- Instruções -->
      <div style="border-top:1px solid #f0f0f0;padding-top:20px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151">Como imprimir:</p>
        <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.8">
          <li>Abra o PDF em qualquer leitor (Adobe, Preview, Chrome)</li>
          <li>Imprima em papel A4, de preferência 180g</li>
          <li>Pode imprimir em preto e branco ou colorido</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #f0f0f0;text-align:center">
      <p style="margin:0;font-size:12px;color:#9ca3af">
        Pedido #${orderId.slice(0, 8).toUpperCase()} ·
        <a href="${APP_URL}/cliente/pedidos" style="color:#6b7280">Ver meus pedidos</a> ·
        <a href="${APP_URL}/politica" style="color:#6b7280">Política de reembolso</a>
      </p>
    </div>
  </div>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Seu download está pronto — ${productName}`,
    html,
  })
}
