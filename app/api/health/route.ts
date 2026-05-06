import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const t0 = Date.now()
    const rows = await sql`SELECT COUNT(*)::int AS n FROM articles_clean`
    const ms = Date.now() - t0
    return NextResponse.json({ ok: true, count: rows[0].n, ms })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
