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

function SubChart({ title, rows }: { title: string; rows: CategoryRow[] }) {
  if (!rows.length) return null
  const maxTotal = Math.max(...rows.map(d => Number(d.total)), 1)

  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 capitalize">{title}</h3>
      <div className="space-y-2">
        {rows.map((row) => {
          const total  = Number(row.total)
          const sold   = Number(row.sold)
          const active = total - sold

          // subcategory label — strip the gender prefix since it's already in the section title
          const name = (
            row.subcategory && row.subcategory !== row.gender
              ? String(row.subcategory)
              : String(row.gender)
          ).replace(/-/g, ' ') || '—'

          const activePct = (active / maxTotal) * 100
          const soldPct   = (sold   / maxTotal) * 100

          const sellRate = row.sold_pct != null ? Number(row.sold_pct).toFixed(1) + '%' : '—'
          const avgPrice = row.avg_price != null ? '€' + Number(row.avg_price).toFixed(2) : '—'

          return (
            <div
              key={`${row.gender}/${row.subcategory}`}
              className="flex items-center gap-2"
              title={`${name} — totale: ${total.toLocaleString('it-IT')} | venduti: ${sold.toLocaleString('it-IT')} (${sellRate}) | prezzo medio: ${avgPrice}`}
            >
              {/* label — fixed width, right-aligned */}
              <div className="w-28 shrink-0 text-right text-xs text-gray-400 truncate capitalize leading-none">
                {name}
              </div>

              {/* bar */}
              <div className="flex-1 flex h-[16px] rounded-sm overflow-hidden bg-gray-800/40">
                {active > 0 && (
                  <div style={{ width: `${activePct}%` }} className="bg-indigo-700" />
                )}
                {sold > 0 && (
                  <div style={{ width: `${soldPct}%` }} className="bg-emerald-500" />
                )}
              </div>

              {/* count */}
              <div className="w-9 shrink-0 text-right text-xs text-gray-500 tabular-nums">
                {fmt(total)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CategoryChart({ data }: { data: CategoryRow[] }) {
  if (!data.length) {
    return <p className="text-gray-600 text-sm py-8 text-center">Nessun dato disponibile</p>
  }

  const donna = data.filter(d => (d.gender || '').toLowerCase() === 'donna')
  const uomo  = data.filter(d => (d.gender || '').toLowerCase() === 'uomo')

  return (
    <div>
      {/* legend */}
      <div className="flex items-center gap-4 mb-4">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-indigo-700" />
          Attivi
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500" />
          Venduti
        </span>
      </div>

      <div className="flex gap-8">
        <SubChart title="Donna" rows={donna} />
        <div className="w-px bg-gray-800 shrink-0" />
        <SubChart title="Uomo" rows={uomo} />
      </div>
    </div>
  )
}
