'use client'

interface CategoryRow {
  gender: string
  subcategory: string
  total: number
  sold: number
  sold_pct: number | null
  avg_price: number | null
}

function fmt(n: number): string {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

export default function CategoryChart({ data }: { data: CategoryRow[] }) {
  if (!data.length) {
    return <p className="text-gray-600 text-sm py-8 text-center">Nessun dato disponibile</p>
  }

  const maxTotal = Math.max(...data.map(d => Number(d.total)), 1)

  return (
    <div className="space-y-2 py-1">
      {/* legend */}
      <div className="flex items-center gap-4 pb-2 pl-[152px]">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-indigo-700" />
          Attivi
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
          Venduti
        </span>
      </div>

      {data.map((row) => {
        const total   = Number(row.total)
        const sold    = Number(row.sold)
        const active  = total - sold

        // Safe label: prefer subcategory, fall back to gender, never show "null"
        const rawName = row.subcategory && row.subcategory !== row.gender
          ? row.subcategory
          : row.gender
        const name = (rawName || '—').replace(/-/g, ' ')

        const activePct = (active / maxTotal) * 100
        const soldPct   = (sold   / maxTotal) * 100

        const sellRate  = row.sold_pct != null ? Number(row.sold_pct).toFixed(1) + '%' : '—'
        const avgPrice  = row.avg_price != null ? '€' + Number(row.avg_price).toFixed(2) : '—'

        return (
          <div
            key={`${row.gender}/${row.subcategory}`}
            className="group flex items-center gap-3"
            title={`${name} — totale: ${total.toLocaleString('it-IT')} | venduti: ${sold.toLocaleString('it-IT')} (${sellRate}) | prezzo medio: ${avgPrice}`}
          >
            {/* fixed-width label — always right-aligned, never overflows */}
            <div className="w-36 shrink-0 text-right text-xs text-gray-400 truncate capitalize leading-none">
              {name}
            </div>

            {/* bar track */}
            <div className="flex-1 flex h-[18px] rounded-sm overflow-hidden bg-gray-800/40">
              {active > 0 && (
                <div
                  style={{ width: `${activePct}%` }}
                  className="bg-indigo-700 transition-all duration-300"
                />
              )}
              {sold > 0 && (
                <div
                  style={{ width: `${soldPct}%` }}
                  className="bg-emerald-500 transition-all duration-300"
                />
              )}
            </div>

            {/* total count */}
            <div className="w-10 shrink-0 text-right text-xs text-gray-500 tabular-nums">
              {fmt(total)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
