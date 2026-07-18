import type { NamingConvention } from '@rpg/contracts/name-generator'

import { STATIC_CONVENTIONS, STATIC_CONVENTION_BY_ID } from '../conventions/manifest'

export function listStaticConventions(): readonly NamingConvention[] {
  return STATIC_CONVENTIONS
}

export function getStaticConvention(conventionId: string): NamingConvention | undefined {
  return STATIC_CONVENTION_BY_ID.get(conventionId)
}

/** @deprecated Use listStaticConventions */
export function listConventions(): readonly NamingConvention[] {
  return listStaticConventions()
}

/** @deprecated Use getStaticConvention or a composed convention lookup */
export function getConvention(conventionId: string): NamingConvention | undefined {
  return getStaticConvention(conventionId)
}
