import { getKpis, getTrend, getCategories, getBrands, getHeatmap, getRecentSold } from '@/lib/queries'
import KpiCards     from '@/components/KpiCards'
import TrendChart   from '@/components/TrendChart'
import CategoryChart from '@/components/CategoryChart'
import BrandTable   from '@/components/BrandTable'
import HeatmapChart from '@/components/HeatmapChart'
import RecentSold   from '@/components/RecentSold'

export const dynamic = 'force-dynamic'   // always fresh data, no static cache

export default async function Dashboard() {
  const [kpis, trend, categories, brands, heatmap, recentSold] = await Promise.all([
    getKpis().catch(() => null),
    getTrend().catch(() => []),
    getCategories().catch(() => []),
    getBrands().catch(() => []),
    getHeatmap().catch(() => []),
    getRecentSold().catch(() => []),
  ])

  const now = new Date().toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📊</span>
            <h1 className="text-xl font-bold tracking-tight">Vinted Analytics</h1>
            <span className="hidden sm:inline text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">LIVE</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="hidden sm:inline">Aggiornato alle {now}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
              >
                Esci →
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* KPI Cards */}
        {kpis ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <KpiCards data={kpis as any} />
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center text-gray-600">
            Impossibile caricare i KPI — verifica la connessione al database.
          </div>
        )}

        {/* Trend chart */}
        <section>
          <h2 className="text-base font-semibold text-gray-300 mb-3">
            Andamento ultimi 7 giorni
          </h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <TrendChart data={trend as any} />
          </div>
        </section>

        {/* Categories — full width, split by gender */}
        <section>
          <h2 className="text-base font-semibold text-gray-300 mb-3">Top categorie</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <CategoryChart data={categories as any} />
          </div>
        </section>

        {/* Heatmap */}
        <section>
          <h2 className="text-base font-semibold text-gray-300 mb-3">
            Vendite per ora e giorno (ultimi 7gg)
          </h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <HeatmapChart data={heatmap as any} />
          </div>
        </section>

        {/* Brand table */}
        <section>
          <h2 className="text-base font-semibold text-gray-300 mb-3">
            Brand — velocità e prezzo mediano
          </h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <BrandTable data={brands as any} />
          </div>
        </section>

        {/* Recent sold */}
        <section>
          <h2 className="text-base font-semibold text-gray-300 mb-3">Ultimi venduti</h2>
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <RecentSold data={recentSold as any} />
          </div>
        </section>

        <footer className="text-center text-xs text-gray-700 py-4">
          Vinted Analytics — dati da <code className="text-gray-600">articles_clean</code>
        </footer>
      </div>
    </main>
  )
}
