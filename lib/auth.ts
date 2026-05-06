/**
 * Simple auth: SHA-256 HMAC of (password + secret) stored as an httpOnly cookie.
 * Works reliably in Next.js 14 with both Node.js and Edge runtimes.
 */

export const AUTH_COOKIE = 'vh_auth'

/** Compute a deterministic auth token from env vars (Web Crypto, works Edge+Node). */
export async function getAuthToken(): Promise<string> {
  const data = new TextEncoder().encode(
    (process.env.DASHBOARD_PASSWORD ?? '') +
    (process.env.SESSION_SECRET ?? 'default-secret')
  )
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const COOKIE_OPTIONS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'lax' as const,
  maxAge:    60 * 60 * 24 * 30,   // 30 days
  path:      '/',
}
