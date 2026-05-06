'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface CategoryRow {
  gender: string
  subcategory: string
  total: number
  sold: number
  sold_pct: number | null
  avg_price: number | null
}

export default function CategoryChart({ data }: { data: CategoryRow[] }) {
  if (!data.length) {
    return <p className="text-gray-600 text-sm py-8 text-center">Nessun dato disponibile</p>
  }

  const formatted = data.map(d => ({
    name: String(d.subcategory).replace(/-/g, ' '),
    active: Number(d.total) - Number(d.sold),
    sold: Number(d.sold),
  }))

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart
        data={formatted}
        layout="vertical"
        margin={{ top: 5, right: 20, bottom: 5, left: 85 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={false}
          tickFormatter={v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={85}
        />
        <Tooltip
          contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#9ca3af' }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
        <Bar dataKey="active" name="Attivi"  stackId="a" fill="#4338ca" />
        <Bar dataKey="sold"   name="Venduti" stackId="a" fill="#22c55e" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
