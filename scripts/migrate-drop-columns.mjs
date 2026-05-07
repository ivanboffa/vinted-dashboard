/**
 * One-time migration: drop the `url` and `description` columns from `articles`
 * to reclaim DB space on the Supabase free tier.
 *
 * Run ONCE after deploying the scraper code that no longer writes these columns:
 *   node scripts/migrate-drop-columns.mjs
 *
 * After this script the columns are gone permanently — no rollback.
 */

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

// Session mode (5432) — required for DDL + VACUUM; transaction pooler (6543) blocks them
const url = process.env.DATABASE_URL.trim().replace(':6543/', ':5432/')
const sql = postgres(url, {
  ssl: { rejectUnauthorized: false }, prepare: false, max: 1,
})

// articles_clean is a SELECT * view — must drop+recreate around the column drops
console.log('Dropping articles_clean view...')
await sql`DROP VIEW IF EXISTS articles_clean`

console.log('Dropping url and description columns...')
await sql`ALTER TABLE articles DROP COLUMN IF EXISTS url`
await sql`ALTER TABLE articles DROP COLUMN IF EXISTS description`
console.log('Columns dropped.')

console.log('Recreating articles_clean view...')
await sql`
  CREATE VIEW articles_clean AS
  SELECT * FROM articles
  WHERE detection_era = 'post_fix'
    AND sourced_as_sold = FALSE
`
console.log('View recreated.')

// VACUUM reclaims the dead-tuple space so PostgreSQL can reuse it for new rows.
// VACUUM FULL would shrink the physical file but requires an exclusive lock (downtime).
// Plain VACUUM is safe and lock-minimal; Supabase autovacuum will handle FULL in time.
console.log('Running VACUUM ANALYZE articles...')
await sql.unsafe('VACUUM ANALYZE articles')
console.log('Done. Space will be reclaimed for reuse by new rows immediately.')
console.log('Note: Supabase may take a few minutes to reflect the reduced DB size in the dashboard.')

await sql.end()
