import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.delete(AUTH_COOKIE)
  return res
}
