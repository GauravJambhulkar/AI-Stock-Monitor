import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Sparkline } from '@/components/charts/Sparkline'

interface MetricCardProps {
  label: string
  value: string
  changeLabel?: string
  trend?: 'up' | 'down' | 'flat'
  icon: LucideIcon
  sparklineData?: number[]
}

export function MetricCard({ label, value, changeLabel, trend = 'flat', icon: Icon, sparklineData }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-bull' : trend === 'down' ? 'text-bear' : 'text-gray-400'

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-1 p-4 shadow-sm transition-colors hover:border-accent/40">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="rounded-lg bg-surface-2 p-2 text-accent">
          <Icon size={16} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-semibold text-gray-50">{value}</p>
          {changeLabel && (
            <p className={`mt-1 flex items-center gap-1 text-sm ${trendColor}`}>
              {trend === 'up' && <ArrowUpRight size={14} />}
              {trend === 'down' && <ArrowDownRight size={14} />}
              {changeLabel}
            </p>
          )}
        </div>
        {sparklineData && <Sparkline data={sparklineData} positive={trend !== 'down'} />}
      </div>
    </div>
  )
}
