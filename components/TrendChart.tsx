'use client'

import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface TrendPoint {
  date: string
  added: number
  sold: number
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return <p className="text-gray-600 text-sm py-8 text-center">Nessun dato disponibile</p>
  }

  const formatted = data.map(d => ({
    ...d,
    date: d.date.slice(5).replace('-', '/'), // "YYYY-MM-DD" → "MM/DD"
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={50}
          tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v)}
        />
        <Tooltip
          contentStyle={{
            background: '#111827',
            border: '1px solid #374151',
            borderRadius: '8px',
            padding: '8px 12px',
          }}
          labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
          itemStyle={{ color: '#e5e7eb' }}
        />
        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingTop: 8 }} />
        <Line
          type="monotone" dataKey="added" name="Aggiunti"
          stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#6366f1' }}
        />
        <Line
          type="monotone" dataKey="sold" name="Venduti"
          stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#22c55e' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
