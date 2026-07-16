import type { NamingConvention } from '@rpg/contracts/name-generator'

import { CONVENTIONS, CONVENTION_BY_ID } from '../conventions/manifest'

export function listConventions(): readonly NamingConvention[] {
  return CONVENTIONS
}

export function getConvention(conventionId: string): NamingConvention | undefined {
  return CONVENTION_BY_ID.get(conventionId)
}
