'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface BrandRow {
  brand: string
  total: number
  sold: number
  sold_pct: number | null
  median_hours_to_sell: number | null
  median_sold_price: number | null
}

type SortKey = keyof BrandRow
type SortDir = 'asc' | 'desc'

function fmtDuration(h: number | null): string {
  if (h == null) return '—'
  const hours = Number(h)
  if (hours < 1) return '< 1h'
  if (hours < 24) return `${Math.round(hours)}h`
  return `${(hours / 24).toFixed(1)}g`
}

const COLS: Array<{ key: SortKey; label: string; right?: boolean }> = [
  { key: 'brand',                label: 'Brand' },
  { key: 'total',                label: 'Totale',       right: true },
  { key: 'sold',                 label: 'Venduti',      right: true },
  { key: 'sold_pct',             label: 'Sell rate',    right: true },
  { key: 'median_hours_to_sell', label: 'Velocità',     right: true },
  { key: 'median_sold_price',    label: 'Prezzo med.',  right: true },
]

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-700 ml-1 text-xs">↕</span>
  return <span className="text-indigo-400 ml-1 text-xs">{dir === 'desc' ? '↓' : '↑'}</span>
}

export default function BrandTable({ data }: { data: BrandRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('sold')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = typeof av === 'string'
      ? String(av).localeCompare(String(bv))
      : Number(av) - Number(bv)
    return sortDir === 'desc' ? -cmp : cmp
  })

  if (!data.length) {
    return <p className="text-gray-600 text-sm text-center py-8">Nessun dato disponibile</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            {COLS.map(c => (
              <th
                key={c.key}
                onClick={() => handleSort(c.key)}
                className={clsx(
                  'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                  'cursor-pointer hover:text-gray-200 select-none transition-colors',
                  c.right ? 'text-right' : 'text-left'
                )}
              >
                {c.label}
                <SortIcon active={sortKey === c.key} dir={sortDir} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.brand}
              className={clsx(
                'border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors',
                i % 2 !== 0 && 'bg-gray-800/10'
              )}
            >
              <td className="px-4 py-2.5 font-medium text-white capitalize">{row.brand}</td>
              <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">
                {Number(row.total).toLocaleString('it-IT')}
              </td>
              <td className="px-4 py-2.5 text-right font-medium text-emerald-400 tabular-nums">
                {Number(row.sold).toLocaleString('it-IT')}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                <span className="text-indigo-400">
                  {row.sold_pct != null ? Number(row.sold_pct).toFixed(1) + '%' : '—'}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">
                {fmtDuration(row.median_hours_to_sell)}
              </td>
              <td className="px-4 py-2.5 text-right text-gray-400 tabular-nums">
                {row.median_sold_price != null ? '€' + Number(row.median_sold_price).toFixed(2) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
