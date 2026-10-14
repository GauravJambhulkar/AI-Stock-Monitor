import { Line, LineChart, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  positive?: boolean
  height?: number
  width?: number
}

export function Sparkline({ data, positive = true, height = 36, width = 90 }: SparklineProps) {
  const points = data.map((value, index) => ({ index, value }))
  const color = positive ? '#22c55e' : '#ef4444'

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
