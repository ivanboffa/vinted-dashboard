'use client'

interface SoldItem {
  vinted_id: string
  title: string | null
  brand: string | null
  price: number
  currency: string | null
  category: string | null
  sold_at: Date | string
  url: string | null
  image_url: string | null
}

function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m fa`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h fa`
  const d = Math.floor(h / 24)
  return `${d}g fa`
}

function formatCat(cat: string | null): string {
  if (!cat) return '—'
  const parts = cat.split('/')
  return parts.slice(-1)[0].replace(/-/g, ' ')
}

export default function RecentSold({ data }: { data: SoldItem[] }) {
  if (!data.length) {
    return <p className="text-gray-600 text-sm text-center py-8">Nessun venduto disponibile</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 w-12" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articolo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Prezzo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quando</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.vinted_id}
              className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors ${i % 2 !== 0 ? 'bg-gray-800/10' : ''}`}
            >
              {/* Thumbnail */}
              <td className="px-4 py-2">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-800"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-xs">—</div>
                )}
              </td>

              {/* Title */}
              <td className="px-4 py-2 max-w-xs">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-white hover:underline truncate block"
                  >
                    {item.title || '—'}
                  </a>
                ) : (
                  <span className="text-gray-300 truncate block">{item.title || '—'}</span>
                )}
              </td>

              <td className="px-4 py-2 text-gray-400 capitalize">{item.brand || '—'}</td>
              <td className="px-4 py-2 text-right font-semibold text-emerald-400 tabular-nums">
                €{Number(item.price).toFixed(2)}
              </td>
              <td className="px-4 py-2 text-gray-500 text-xs hidden md:table-cell capitalize">
                {formatCat(item.category)}
              </td>
              <td className="px-4 py-2 text-right text-gray-600 text-xs tabular-nums whitespace-nowrap">
                {timeAgo(item.sold_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
