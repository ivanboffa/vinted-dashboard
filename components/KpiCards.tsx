'use client'

import clsx from 'clsx'

interface KpiData {
  active_count: number
  sold_count: number
  sold_rate_pct: number | null
  avg_sold_price: number | null
  avg_active_price: number | null
  added_today: number
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return '—'
  const v = Number(n)
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(1) + 'k'
  return String(v)
}

function fmtEuro(n: number | null | undefined): string {
  if (n == null) return '—'
  return '€' + Number(n).toFixed(2)
}

interface CardProps {
  label: string
  value: string
  sub?: string
  accent?: string
  icon: string
}

function Card({ label, value, sub, accent, icon }: CardProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={clsx('text-3xl font-bold tabular-nums', accent ?? 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  )
}

export default function KpiCards({ data }: { data: KpiData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card icon="📦" label="Articoli attivi"   value={fmtNum(data.active_count)} />
      <Card icon="✅" label="Venduti totali"    value={fmtNum(data.sold_count)}   accent="text-emerald-400" />
      <Card
        icon="📈"
        label="Tasso vendita"
        value={data.sold_rate_pct != null ? Number(data.sold_rate_pct).toFixed(1) + '%' : '—'}
        accent="text-indigo-400"
      />
      <Card
        icon="💶"
        label="Prezzo medio venduto"
        value={fmtEuro(data.avg_sold_price)}
        sub={data.avg_active_price != null ? `attivi: ${fmtEuro(data.avg_active_price)}` : undefined}
      />
      <Card icon="🆕" label="Aggiunti oggi" value={fmtNum(data.added_today)} accent="text-sky-400" />
    </div>
  )
}
