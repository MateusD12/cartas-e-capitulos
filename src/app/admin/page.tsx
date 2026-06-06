import { DollarSign, ShoppingBag, TrendingUp, BarChart2 } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/admin/MetricCard'
import { SalesChart } from '@/components/admin/SalesChart'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getMetrics() {
  const admin = createAdminClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ data: todayOrders }, { data: monthOrders }, { data: allOrders }] = await Promise.all([
    admin.from('orders').select('amount').eq('status', 'paid').gte('paid_at', todayStart),
    admin.from('orders').select('amount').eq('status', 'paid').gte('paid_at', monthStart),
    admin.from('orders').select('status'),
  ])

  const todayRevenue = (todayOrders ?? []).reduce((s, o) => s + Number(o.amount), 0)
  const monthRevenue = (monthOrders ?? []).reduce((s, o) => s + Number(o.amount), 0)
  const total = allOrders?.length ?? 0
  const paid = allOrders?.filter((o) => o.status === 'paid').length ?? 0
  const conversion = total > 0 ? Math.round((paid / total) * 100) : 0

  // Últimos 7 dias
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
  const chartDataPromises = days.map(async (d) => {
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
    const { data } = await admin.from('orders').select('amount').eq('status', 'paid').gte('paid_at', start).lt('paid_at', end)
    return {
      date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total: (data ?? []).reduce((s, o) => s + Number(o.amount), 0),
    }
  })
  const chartData = await Promise.all(chartDataPromises)

  return { todayRevenue, monthRevenue, paid, conversion, chartData }
}

export default async function AdminDashboardPage() {
  const { todayRevenue, monthRevenue, paid, conversion, chartData } = await getMetrics()

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Faturamento hoje"
          value={formatCurrency(todayRevenue)}
          icon={<DollarSign size={20} className="text-green-600" />}
          color="bg-green-50"
        />
        <MetricCard
          title="Faturamento do mês"
          value={formatCurrency(monthRevenue)}
          icon={<TrendingUp size={20} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <MetricCard
          title="Pedidos pagos"
          value={String(paid)}
          icon={<ShoppingBag size={20} className="text-purple-600" />}
          color="bg-purple-50"
        />
        <MetricCard
          title="Taxa de conversão"
          value={`${conversion}%`}
          icon={<BarChart2 size={20} className="text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <SalesChart data={chartData} />
    </div>
  )
}
