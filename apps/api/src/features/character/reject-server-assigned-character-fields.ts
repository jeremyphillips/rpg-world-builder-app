import type { NextFunction, Request, Response } from 'express'

import { assertNoServerAssignedCharacterFields } from './assert-standalone-pc-create'

/** Runs before Zod validation so forbidden server-owned fields are not silently stripped. */
export function rejectServerAssignedCharacterFields(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    assertNoServerAssignedCharacterFields(req.body)
    next()
  } catch (err) {
    next(err)
  }
}
