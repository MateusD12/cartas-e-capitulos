interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  color?: string
}

export function MetricCard({ title, value, subtitle, icon, color = 'bg-brand-green/10' }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="font-display font-bold text-2xl text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-3 rounded-xl`}>{icon}</div>
      </div>
    </div>
  )
}
