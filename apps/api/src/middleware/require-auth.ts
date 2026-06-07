import type { NextFunction, Request, Response } from 'express'

import { SESSION_COOKIE } from '../lib/cookies'
import { verifySessionToken } from '../lib/jwt'
import { HttpError } from '../lib/http-error'
import { findSessionUserById } from '../features/user'

/**
 * Require a valid session cookie. Verifies the JWT, confirms the user still
 * exists, and attaches the session user to `req.user`. Responds 401 otherwise.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE] as string | undefined
  const claims = token ? verifySessionToken(token) : null
  if (!claims) {
    next(HttpError.unauthorized())
    return
  }

  const user = await findSessionUserById(claims.sub)
  if (!user) {
    next(HttpError.unauthorized())
    return
  }

  req.user = user
  next()
}
