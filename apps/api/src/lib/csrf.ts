import { randomBytes, timingSafeEqual } from 'node:crypto'

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

/** Constant-time comparison of the cookie token and the header token. */
export function csrfTokensMatch(cookieToken?: string, headerToken?: string): boolean {
  if (!cookieToken || !headerToken) return false
  const a = Buffer.from(cookieToken)
  const b = Buffer.from(headerToken)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
