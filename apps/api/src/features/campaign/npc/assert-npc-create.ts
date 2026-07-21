import type { NextFunction, Request, Response } from 'express'
import { SYSTEM_RULESET_IDS, type CreateNpcRequestInput } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

const SERVER_ASSIGNED_NPC_FIELDS = [
  'id',
  'userId',
  'characterType',
  'campaignId',
  'createdAt',
  'updatedAt',
] as const

/** Rejects client-supplied server-owned NPC fields before Zod strips them. */
export function rejectNpcServerAssignedFields(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const body = req.body
  if (!body || typeof body !== 'object') {
    next()
    return
  }

  for (const field of SERVER_ASSIGNED_NPC_FIELDS) {
    if (field in body) {
      next(HttpError.badRequest(`Client must not supply ${field}.`))
      return
    }
  }

  next()
}

/** Validates NPC create request fields beyond the permissive wire schema. */
export function assertNpcCreateRequestRestrictions(input: CreateNpcRequestInput): void {
  if (!SYSTEM_RULESET_IDS.includes(input.rulesetId as (typeof SYSTEM_RULESET_IDS)[number])) {
    throw HttpError.badRequest('Unsupported rulesetId.')
  }
}
