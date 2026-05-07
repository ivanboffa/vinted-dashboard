import postgres from 'postgres'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const envContent = readFileSync(resolve(__dir, '../.env.local'), 'utf8')
for (const line of envContent.split('\n')) {
  const [key, ...vals] = line.split('=')
  if (key && vals.length) process.env[key.trim()] = vals.join('=').trim()
}

// Use session mode (5432) + disable timeout, same as bench-queries.mjs
const url = process.env.DATABASE_URL.trim().replace(':6543/', ':5432/')
const sql = postgres(url, {
  ssl: { rejectUnauthorized: false }, prepare: false, max: 1,
})
await sql`SET statement_timeout = 0`

const [r] = await sql`
  SELECT
    COUNT(*)::int                                                         AS total,
    COUNT(*) FILTER (WHERE status='active')::int                          AS active,
    COUNT(*) FILTER (WHERE status='sold')::int                            AS sold,
    COUNT(*) FILTER (WHERE status='deleted')::int                         AS deleted,
    ROUND(COUNT(*) FILTER (WHERE status='sold')::numeric
      / NULLIF(COUNT(*),0)*100, 2)::float8                               AS sell_rate_pct,
    COUNT(*) FILTER (WHERE first_seen_at >= NOW()-INTERVAL '1 hour')::int AS added_1h,
    COUNT(*) FILTER (WHERE first_seen_at >= NOW()-INTERVAL '24 hours')::int AS added_24h,
    COUNT(*) FILTER (WHERE sold_at    >= NOW()-INTERVAL '24 hours')::int  AS sold_24h,
    COUNT(*) FILTER (WHERE sold_at    >= NOW()-INTERVAL '7 days')::int    AS sold_7d,
    MIN(first_seen_at)::text                                              AS oldest_article,
    MAX(first_seen_at)::text                                              AS newest_article,
    MAX(sold_at)::text                                                    AS last_sold_at
  FROM articles_clean
`

console.log('\n=== articles_clean ===')
console.log(`  Total:        ${r.total.toLocaleString('it-IT')}`)
console.log(`  Active:       ${r.active.toLocaleString('it-IT')}`)
console.log(`  Sold:         ${r.sold.toLocaleString('it-IT')}  (${r.sell_rate_pct}%)`)
console.log(`  Deleted:      ${r.deleted.toLocaleString('it-IT')}`)
console.log(`  Added last 1h:  ${r.added_1h}`)
console.log(`  Added last 24h: ${r.added_24h}`)
console.log(`  Sold last 24h:  ${r.sold_24h}`)
console.log(`  Sold last 7d:   ${r.sold_7d}`)
console.log(`  Oldest article: ${r.oldest_article}`)
console.log(`  Newest article: ${r.newest_article}`)
console.log(`  Last sold_at:   ${r.last_sold_at}`)

await sql.end()
