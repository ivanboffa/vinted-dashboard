import { SessionOptions } from 'iron-session'

export interface SessionData {
  authenticated?: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'fallback-secret-replace-in-production-32ch!!',
  cookieName: 'vh_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
}
