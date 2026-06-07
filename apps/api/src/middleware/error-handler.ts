import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

import { loadEnv } from '../env'
import { HttpError } from '../lib/http-error'

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'not_found', message: 'Resource not found' } })
}

/** Central error handler. Maps known error shapes to stable JSON responses. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (res.headersSent) return

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'bad_request',
        message: 'Validation failed',
        details: {
          issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        },
      },
    })
    return
  }

  // Mongoose duplicate-key error (e.g. unique email).
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: { code: 'conflict', message: 'Resource already exists' } })
    return
  }

  const { isProduction } = loadEnv()
  if (!isProduction) {
    console.error('[api] unhandled error:', err)
  }
  res.status(500).json({ error: { code: 'internal_error', message: 'Internal server error' } })
}
