import { namingConventionSchema, type NamingConvention } from '@rpg/contracts/name-generator'

import { draconicDragonPersonalConvention } from './draconic-dragon-personal'
import { factionGeneralConvention } from './faction-general'

const RAW_STATIC_CONVENTIONS = [draconicDragonPersonalConvention, factionGeneralConvention] as const

export const STATIC_CONVENTIONS: readonly NamingConvention[] = RAW_STATIC_CONVENTIONS.map(
  (convention) => namingConventionSchema.parse(convention),
)

export const STATIC_CONVENTION_BY_ID = new Map(
  STATIC_CONVENTIONS.map((convention) => [convention.id, convention]),
)

/** @deprecated Use STATIC_CONVENTIONS — unmigrated conventions only. */
export const CONVENTIONS = STATIC_CONVENTIONS

/** @deprecated Use STATIC_CONVENTION_BY_ID */
export const CONVENTION_BY_ID = STATIC_CONVENTION_BY_ID
