import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface AllocationSlice {
  name: string
  value: number
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#eab308']

export function AllocationChart({ data }: { data: AllocationSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 }), undefined]}
          contentStyle={{ background: '#161b26', border: '1px solid #262d3d', borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
