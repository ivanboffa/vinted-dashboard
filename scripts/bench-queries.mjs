import postgres from 'postgres'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
const envContent = readFileSync(envPath, 'utf8')
for (const line of envContent.split('\n')) {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
}

// Use session mode for accurate timing without pooler overhead
const url = process.env.DATABASE_URL.trim().replace(':6543/', ':5432/')
const sql = postgres(url, { ssl: { rejectUnauthorized: false }, prepare: false, max: 1 })

await sql`SET statement_timeout = 0`

async function time(label, fn) {
  const t0 = Date.now()
  const rows = await fn()
  const ms = Date.now() - t0
  const rowCount = Array.isArray(rows) ? rows.length : (rows ? 1 : 0)
  console.log(`  ${label.padEnd(20)} ${String(ms).padStart(6)}ms  (${rowCount} rows)`)
}

const start = new Date()
start.setUTCDate(start.getUTCDate() - 29)
const startStr = start.toISOString().split('T')[0]
const cutoff = new Date()
cutoff.setUTCDate(cutoff.getUTCDate() - 30)
const cutoffStr = cutoff.toISOString().split('T')[0]

console.log('\nBenchmarking queries against articles_clean...\n')

await time('getKpis', () => sql`
  SELECT
    COUNT(*)::int AS total_count,
    COUNT(*) FILTER (WHERE status='active')::int AS active_count,
    COUNT(*) FILTER (WHERE status='sold')::int AS sold_count,
    COUNT(*) FILTER (WHERE status='deleted')::int AS deleted_count
  FROM articles_clean
`)

await time('getTrend', () => sql`
  WITH date_series AS (
    SELECT generate_series(${startStr}::date, CURRENT_DATE, '1 day'::interval)::date AS date
  ),
  daily_added AS (
    SELECT DATE(first_seen_at) AS date, COUNT(*)::int AS added
    FROM articles_clean WHERE first_seen_at >= ${startStr}::date GROUP BY 1
  ),
  daily_sold AS (
    SELECT DATE(sold_at) AS date, COUNT(*)::int AS sold
    FROM articles_clean WHERE status='sold' AND sold_at IS NOT NULL AND sold_at >= ${startStr}::date GROUP BY 1
  )
  SELECT ds.date::text, COALESCE(da.added,0) AS added, COALESCE(dso.sold,0) AS sold
  FROM date_series ds
  LEFT JOIN daily_added da ON da.date=ds.date
  LEFT JOIN daily_sold dso ON dso.date=ds.date
  ORDER BY 1
`)

await time('getCategories', () => sql`
  SELECT SPLIT_PART(category,'/',1) AS gender,
    COALESCE(NULLIF(SPLIT_PART(category,'/',2),''),SPLIT_PART(category,'/',1)) AS subcategory,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE status='sold')::int AS sold
  FROM articles_clean
  WHERE category IS NOT NULL AND TRIM(category)!=''
  GROUP BY 1,2 ORDER BY total DESC LIMIT 15
`)

await time('getBrands', () => sql`
  SELECT brand,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE status='sold')::int AS sold,
    ROUND(AVG(EXTRACT(EPOCH FROM (sold_at - vinted_created_at))/3600.0) FILTER (
      WHERE status='sold' AND vinted_created_at IS NOT NULL AND sold_at > vinted_created_at
    ), 1)::float8 AS avg_hours_to_sell,
    ROUND(AVG(price) FILTER (WHERE status='sold'), 2)::float8 AS avg_sold_price
  FROM articles_clean
  WHERE brand IS NOT NULL AND TRIM(brand)!=''
  GROUP BY brand HAVING COUNT(*)>=5
  ORDER BY sold DESC, total DESC LIMIT 20
`)

await time('getHeatmap', () => sql`
  SELECT ((EXTRACT(DOW FROM sold_at)::int+6)%7) AS weekday,
    EXTRACT(HOUR FROM sold_at)::int AS hour,
    COUNT(*)::int AS sales_count
  FROM articles_clean
  WHERE status='sold' AND sold_at IS NOT NULL AND sold_at>=${cutoffStr}::date
  GROUP BY 1,2 ORDER BY 1,2
`)

await time('getRecentSold', () => sql`
  SELECT vinted_id,title,brand,price::float8,category,sold_at,url,image_url
  FROM articles_clean WHERE status='sold' AND sold_at IS NOT NULL
  ORDER BY sold_at DESC LIMIT 40
`)

await sql.end()
console.log('\nDone.')
