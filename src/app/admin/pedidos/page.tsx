'use client'

import { useEffect, useState, useCallback } from 'react'
import { Link, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
}

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-600',
  paid:    'bg-green-50  text-green-600',
  failed:  'bg-red-50    text-red-500',
}

type Filter = 'todos' | OrderStatus

const filters: { value: Filter; label: string }[] = [
  { value: 'todos',   label: 'Todos'     },
  { value: 'pending', label: 'Pendentes' },
  { value: 'paid',    label: 'Pagos'     },
  { value: 'failed',  label: 'Falhos'    },
]

export default function AdminPedidosPage() {
  const [orders, setOrders]                   = useState<Order[]>([])
  const [loading, setLoading]                 = useState(true)
  const [filter, setFilter]                   = useState<Filter>('todos')
  const [generatingLink, setGeneratingLink]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter !== 'todos') params.set('status', filter)
    const res = await fetch(`/api/admin/orders?${params}`)
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const generateDownloadLink = async (orderId: string) => {
    setGeneratingLink(orderId)
    try {
      const res = await fetch(`/api/admin/download-link?orderId=${orderId}`)
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    } catch {
      toast.error('Erro ao gerar link de download')
    } finally {
      setGeneratingLink(null)
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-xl md:text-2xl text-gray-800 mb-4">Pedidos</h1>

      {/* Filtros — scroll horizontal no mobile */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-brand-green text-gray-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          Nenhum pedido encontrado.
        </div>
      ) : (
        <>
          {/* ── Cards mobile ─────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{o.buyer_email ?? '—'}</p>
                    <p className="text-sm font-medium text-gray-800 truncate mt-0.5">
                      {(o.products as { name: string } | null)?.name ?? '—'}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${statusColors[o.status]}`}>
                    {statusLabels[o.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-display font-bold text-gray-900">{formatCurrency(o.amount)}</span>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(o.created_at)}</span>
                  </div>
                  {o.status === 'paid' && (
                    <button
                      onClick={() => generateDownloadLink(o.id)}
                      disabled={generatingLink === o.id}
                      className="flex items-center gap-1.5 text-xs text-brand-green-dark font-medium hover:underline disabled:opacity-50"
                    >
                      {generatingLink === o.id ? <Loader2 size={12} className="animate-spin" /> : <Link size={12} />}
                      Copiar link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabela desktop ───────────────────────────── */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-gray-500 font-medium">Cliente</th>
                  <th className="text-left p-4 text-gray-500 font-medium">Produto</th>
                  <th className="text-right p-4 text-gray-500 font-medium">Valor</th>
                  <th className="text-center p-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-500 font-medium hidden lg:table-cell">Data</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-700 max-w-[160px] truncate">{o.buyer_email ?? '—'}</td>
                    <td className="p-4 text-gray-500 max-w-[160px] truncate">
                      {(o.products as { name: string } | null)?.name ?? '—'}
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(o.amount)}</td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[o.status]}`}>
                        {statusLabels[o.status]}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs hidden lg:table-cell">{formatDate(o.created_at)}</td>
                    <td className="p-4 text-right">
                      {o.status === 'paid' && (
                        <button
                          onClick={() => generateDownloadLink(o.id)}
                          disabled={generatingLink === o.id}
                          aria-label="Copiar link de download"
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                        >
                          {generatingLink === o.id ? <Loader2 size={14} className="animate-spin" /> : <Link size={14} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
