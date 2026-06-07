import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

import { HttpError } from '../lib/http-error'

type Source = 'body' | 'query' | 'params'

/**
 * Validate a request segment against a Zod schema (from `@rpg/contracts`).
 * On success the parsed/coerced value replaces the original; on failure a 400
 * with structured issues is forwarded to the error handler.
 */
export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      next(
        HttpError.badRequest('Validation failed', {
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        }),
      )
      return
    }
    // params is read-only in Express 5; only reassign mutable sources.
    if (source !== 'params') {
      req[source] = result.data as never
    }
    next()
  }
}
