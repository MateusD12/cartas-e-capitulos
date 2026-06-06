import { Download, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order } from '@/types'

const statusConfig = {
  paid: { label: 'Pago', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
  pending: { label: 'Pendente', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  failed: { label: 'Falhou', icon: XCircle, color: 'text-red-500 bg-red-50' },
}

export const dynamic = 'force-dynamic'

export default async function MeusPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, products(name, cover_image_url)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const typedOrders = (orders ?? []) as Order[]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-800">Meus pedidos</h1>
        <a href="/" className="text-sm text-brand-green-dark hover:underline">← Voltar à loja</a>
      </div>

      {typedOrders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">Você ainda não fez nenhum pedido.</p>
          <a href="/" className="mt-4 inline-flex items-center gap-2 text-brand-green-dark text-sm hover:underline">
            Explorar produtos
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {typedOrders.map((order) => {
            const status = statusConfig[order.status] ?? statusConfig.pending
            const StatusIcon = status.icon
            const productName = (order.products as { name: string } | null)?.name ?? 'Produto'

            return (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-display font-bold text-gray-900 text-sm">
                    {formatCurrency(order.amount)}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                  {order.status === 'paid' && (
                    <a
                      href={`/api/download?orderId=${order.id}`}
                      className="flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-gray-800 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      aria-label={`Baixar PDF de ${productName}`}
                    >
                      <Download size={13} />
                      Baixar PDF
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
