import type { NextFunction, Request, Response } from 'express'

import { CSRF_COOKIE, CSRF_HEADER } from '../lib/cookies'
import { csrfTokensMatch } from '../lib/csrf'
import { HttpError } from '../lib/http-error'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/**
 * Double-submit CSRF guard. Safe (non-mutating) methods pass through. For
 * mutations the readable `rpg_csrf` cookie must match the `x-csrf-token`
 * header; clients obtain a token from `GET /api/auth/csrf` first.
 */
export function verifyCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined
  const headerToken = req.get(CSRF_HEADER) ?? undefined

  if (!csrfTokensMatch(cookieToken, headerToken)) {
    next(HttpError.forbidden('Invalid or missing CSRF token'))
    return
  }

  next()
}
