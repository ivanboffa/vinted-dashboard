import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthToken, AUTH_COOKIE } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths — no auth needed
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(AUTH_COOKIE)?.value
  if (!cookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const expected = await getAuthToken()
  if (cookie !== expected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
