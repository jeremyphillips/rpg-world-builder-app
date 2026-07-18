import { namingConventionSchema, type NamingConvention } from '@rpg/contracts/name-generator'

import { akanPersonalConvention } from './akan-personal'
import { draconicDragonPersonalConvention } from './draconic-dragon-personal'
import { draconicDragonbornClanConvention } from './draconic-dragonborn-clan'
import { draconicDragonbornPersonalConvention } from './draconic-dragonborn-personal'
import { dwarvenPersonalConvention } from './dwarven-personal'
import { dwarvenSettlementConvention } from './dwarven-settlement'
import { factionGeneralConvention } from './faction-general'
import { gnomishPersonalConvention } from './gnomish-personal'
import { gnomishSettlementConvention } from './gnomish-settlement'
import { goliathPersonalConvention } from './goliath-personal'
import { halflingPersonalConvention } from './halfling-personal'
import { halflingSettlementConvention } from './halfling-settlement'
import { infernalTieflingPersonalConvention } from './infernal-tiefling-personal'
import { orcPersonalConvention } from './orc-personal'

const RAW_STATIC_CONVENTIONS = [
  draconicDragonPersonalConvention,
  draconicDragonbornPersonalConvention,
  draconicDragonbornClanConvention,
  dwarvenPersonalConvention,
  dwarvenSettlementConvention,
  halflingPersonalConvention,
  halflingSettlementConvention,
  infernalTieflingPersonalConvention,
  gnomishPersonalConvention,
  gnomishSettlementConvention,
  goliathPersonalConvention,
  orcPersonalConvention,
  factionGeneralConvention,
  akanPersonalConvention,
] as const

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
