import { format, parseISO } from 'date-fns'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HistoricalPrice } from '@/types/stock'

interface StockPriceChartProps {
  data: HistoricalPrice[]
  positive: boolean
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <p className="text-gray-400">{format(parseISO(label), 'MMM d, yyyy')}</p>
      <p className="font-semibold text-gray-100">{payload[0].value.toFixed(2)}</p>
    </div>
  )
}

export function StockPriceChart({ data, positive }: StockPriceChartProps) {
  const color = positive ? '#22c55e' : '#ef4444'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#262d3d" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: '#262d3d' }}
          tickLine={false}
          minTickGap={30}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill="url(#priceGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
