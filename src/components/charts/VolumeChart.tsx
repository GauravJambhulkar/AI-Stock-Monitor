import { format, parseISO } from 'date-fns'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { HistoricalPrice } from '@/types/stock'

interface VolumeChartProps {
  data: HistoricalPrice[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <ResponsiveContainer width="100%" height={90}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => format(parseISO(value), 'MMM d')}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: '#262d3d' }}
          tickLine={false}
          minTickGap={30}
        />
        <Tooltip
          formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Volume']}
          labelFormatter={(value) => (typeof value === 'string' ? format(parseISO(value), 'MMM d, yyyy') : '')}
          contentStyle={{ background: '#161b26', border: '1px solid #262d3d', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="volume" fill="#3b82f6" opacity={0.5} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
