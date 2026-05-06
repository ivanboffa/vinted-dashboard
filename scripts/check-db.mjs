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

// Check TRANSACTION POOLER (same as Vercel)
const txUrl = process.env.DATABASE_URL.trim()
console.log('Testing TRANSACTION POOLER (port 6543)...')
const sqlTx = postgres(txUrl, {
  ssl: { rejectUnauthorized: false },
  prepare: false,
  max: 1,
  connect_timeout: 10,
})

try {
  const r = await sqlTx`SHOW statement_timeout`
  console.log('  statement_timeout =', r[0].statement_timeout)
} catch (e) { console.log('  SHOW error:', e.message) }

try {
  const t0 = Date.now()
  const r = await sqlTx`SELECT COUNT(*)::int AS n FROM articles_clean`
  console.log(`  COUNT(*) = ${r[0].n} in ${Date.now()-t0}ms`)
} catch (e) { console.log('  COUNT error:', e.message) }

await sqlTx.end()

// Check with options to disable timeout
console.log('\nTesting TX POOLER with statement_timeout=0 via options...')
const txUrl2 = txUrl + '?options=-c%20statement_timeout%3D0'
const sqlTx2 = postgres(txUrl2, {
  ssl: { rejectUnauthorized: false },
  prepare: false,
  max: 1,
})
try {
  const r = await sqlTx2`SHOW statement_timeout`
  console.log('  statement_timeout =', r[0].statement_timeout)
} catch (e) { console.log('  SHOW error:', e.message) }

try {
  const t0 = Date.now()
  const r = await sqlTx2`SELECT COUNT(*)::int AS n FROM articles_clean`
  console.log(`  COUNT(*) = ${r[0].n} in ${Date.now()-t0}ms`)
} catch (e) { console.log('  COUNT error:', e.message) }

await sqlTx2.end()
console.log('\nDone.')
