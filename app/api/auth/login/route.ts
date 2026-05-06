import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (!password || password !== process.env.DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = await getAuthToken()
    const res = NextResponse.json({ ok: true })
    res.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)
    return res
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
