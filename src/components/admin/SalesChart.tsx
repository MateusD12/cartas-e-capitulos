'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesData {
  date: string
  total: number
}

export function SalesChart({ data }: { data: SalesData[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="font-display font-semibold text-gray-800 mb-4">Vendas — últimos 7 dias</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
            contentStyle={{ borderRadius: 12, border: '1px solid #f0f0f0', fontSize: 12 }}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#A8D8A8" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
