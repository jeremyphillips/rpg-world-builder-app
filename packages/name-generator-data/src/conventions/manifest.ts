import { namingConventionSchema, type NamingConvention } from '@rpg/contracts/name-generator'

import { akanPersonalConvention } from './akan-personal'
import { draconicDragonPersonalConvention } from './draconic-dragon-personal'
import { draconicDragonbornClanConvention } from './draconic-dragonborn-clan'
import { dwarvenSettlementConvention } from './dwarven-settlement'
import { elvishPersonalConvention } from './elvish-personal'
import { elvishSettlementConvention } from './elvish-settlement'
import { factionGeneralConvention } from './faction-general'

const RAW_CONVENTIONS = [
  elvishPersonalConvention,
  elvishSettlementConvention,
  draconicDragonPersonalConvention,
  draconicDragonbornClanConvention,
  dwarvenSettlementConvention,
  factionGeneralConvention,
  akanPersonalConvention,
] as const

export const CONVENTIONS: readonly NamingConvention[] = RAW_CONVENTIONS.map((convention) =>
  namingConventionSchema.parse(convention),
)

export const CONVENTION_BY_ID = new Map(
  CONVENTIONS.map((convention) => [convention.id, convention]),
)
