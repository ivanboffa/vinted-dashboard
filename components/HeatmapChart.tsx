'use client'

interface HeatmapRow {
  weekday: number
  hour: number
  sales_count: number
}

const DAYS  = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function HeatmapChart({ data }: { data: HeatmapRow[] }) {
  // Build lookup and find max
  const map = new Map<string, number>()
  let maxVal = 1
  for (const row of data) {
    const count = Number(row.sales_count)
    map.set(`${row.weekday}-${row.hour}`, count)
    if (count > maxVal) maxVal = count
  }

  function cellColor(count: number): string {
    if (count === 0) return '#1f2937'
    const t = count / maxVal
    if (t < 0.15) return '#064e3b'
    if (t < 0.35) return '#065f46'
    if (t < 0.55) return '#047857'
    if (t < 0.75) return '#059669'
    return '#10b981'
  }

  if (!data.length) {
    return <p className="text-gray-600 text-sm py-8 text-center">Nessun dato disponibile</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: 320 }}>
        <thead>
          <tr>
            <th className="w-8" />
            {HOURS.map(h => (
              <th
                key={h}
                className={clsx(
                  'text-center pb-1 font-normal',
                  h % 6 === 0 ? 'text-gray-500 text-xs' : 'text-transparent text-xs'
                )}
                style={{ width: `${100 / 24}%` }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, di) => (
            <tr key={di}>
              <td className="pr-2 text-right text-xs text-gray-500 w-8 whitespace-nowrap">{day}</td>
              {HOURS.map(hour => {
                const count = map.get(`${di}-${hour}`) ?? 0
                return (
                  <td
                    key={hour}
                    title={`${day} ${hour}:00 — ${count} vendite`}
                    style={{ backgroundColor: cellColor(count), height: 22 }}
                    className="border border-gray-950 rounded-sm cursor-default"
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-gray-600">Meno</span>
        {['#1f2937', '#064e3b', '#065f46', '#047857', '#059669', '#10b981'].map(c => (
          <span key={c} className="inline-block w-4 h-4 rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span className="text-xs text-gray-600">Di più</span>
      </div>
    </div>
  )
}

// tiny helper — clsx not imported to keep bundle minimal
function clsx(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(' ')
}
