import { SYSTEM_RULESET_IDS, type CreateCharacterInput } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'

const SERVER_ASSIGNED_CHARACTER_FIELDS = ['id', 'userId', 'createdAt', 'updatedAt'] as const

/** Rejects client-supplied server-owned character fields before Zod strips them. */
export function assertNoServerAssignedCharacterFields(body: unknown): void {
  if (!body || typeof body !== 'object') return

  for (const field of SERVER_ASSIGNED_CHARACTER_FIELDS) {
    if (field in body) {
      throw HttpError.badRequest(`Client must not supply ${field}.`)
    }
  }
}

/** Enforces MVP standalone PC create restrictions beyond the permissive input schema. */
export function assertStandalonePcCreateRestrictions(input: CreateCharacterInput): void {
  if (input.characterType !== 'pc') {
    throw HttpError.badRequest('Only player characters can be created.')
  }

  if (input.campaignId != null) {
    throw HttpError.badRequest('Standalone characters must not be assigned to a campaign.')
  }

  if (!SYSTEM_RULESET_IDS.includes(input.rulesetId as (typeof SYSTEM_RULESET_IDS)[number])) {
    throw HttpError.badRequest('Unsupported rulesetId.')
  }
}
