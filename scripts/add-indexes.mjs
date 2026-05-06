/**
 * One-off script: add performance indexes for the analytics dashboard.
 * Uses session-mode pooler (port 5432) so we can SET statement_timeout = 0.
 * Run: node scripts/add-indexes.mjs
 */
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load .env.local manually
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
}

// Use session-mode pooler (port 5432) instead of transaction pooler (6543)
// to allow SET statement_timeout and CREATE INDEX CONCURRENTLY
const url = process.env.DATABASE_URL.trim().replace(':6543/', ':5432/')
console.log('Connecting via session pooler (port 5432)...')

const sql = postgres(url, {
  ssl: { rejectUnauthorized: false },
  prepare: false,
  max: 1,
  connect_timeout: 30,
})

// Disable statement timeout for this session
await sql`SET statement_timeout = 0`
console.log('statement_timeout disabled\n')

const indexes = [
  // Composite for clean-view base filter + status (most queries)
  `CREATE INDEX IF NOT EXISTS idx_art_era_sold_status
     ON articles (detection_era, sourced_as_sold, status)`,
  // Composite for sold_at-based queries (heatmap, recentSold, trend sold)
  `CREATE INDEX IF NOT EXISTS idx_art_era_sold_soldat
     ON articles (detection_era, sourced_as_sold, sold_at DESC NULLS LAST)
     WHERE sold_at IS NOT NULL`,
  // Composite for first_seen_at-based queries (trend added, KPI added_today)
  `CREATE INDEX IF NOT EXISTS idx_art_era_sold_firstseen
     ON articles (detection_era, sourced_as_sold, first_seen_at DESC)`,
  // Composite for brand aggregation
  `CREATE INDEX IF NOT EXISTS idx_art_era_sold_brand
     ON articles (detection_era, sourced_as_sold, brand)
     WHERE brand IS NOT NULL`,
  // Composite for category aggregation
  `CREATE INDEX IF NOT EXISTS idx_art_era_sold_category
     ON articles (detection_era, sourced_as_sold, category)
     WHERE category IS NOT NULL`,
]

console.log('Creating indexes...')
for (const ddl of indexes) {
  const name = ddl.match(/idx_\w+/)?.[0] ?? '?'
  process.stdout.write(`  ${name} ... `)
  const t0 = Date.now()
  try {
    await sql.unsafe(ddl)
    console.log(`✓ (${Date.now() - t0}ms)`)
  } catch (e) {
    console.log(`⚠ ${e.message}`)
  }
}

await sql.end()
console.log('\nDone.')
