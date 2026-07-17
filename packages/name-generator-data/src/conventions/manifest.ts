import { namingConventionSchema, type NamingConvention } from '@rpg/contracts/name-generator'

import { akanPersonalConvention } from './akan-personal'
import { draconicDragonPersonalConvention } from './draconic-dragon-personal'
import { draconicDragonbornClanConvention } from './draconic-dragonborn-clan'
import { draconicDragonbornPersonalConvention } from './draconic-dragonborn-personal'
import { dwarvenPersonalConvention } from './dwarven-personal'
import { dwarvenSettlementConvention } from './dwarven-settlement'
import { elvishPersonalConvention } from './elvish-personal'
import { elvishSettlementConvention } from './elvish-settlement'
import { factionGeneralConvention } from './faction-general'
import { gnomishPersonalConvention } from './gnomish-personal'
import { gnomishSettlementConvention } from './gnomish-settlement'
import { goliathPersonalConvention } from './goliath-personal'
import { halflingPersonalConvention } from './halfling-personal'
import { halflingSettlementConvention } from './halfling-settlement'
import { infernalTieflingPersonalConvention } from './infernal-tiefling-personal'
import { orcPersonalConvention } from './orc-personal'

const RAW_CONVENTIONS = [
  elvishPersonalConvention,
  elvishSettlementConvention,
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

export const CONVENTIONS: readonly NamingConvention[] = RAW_CONVENTIONS.map((convention) =>
  namingConventionSchema.parse(convention),
)

export const CONVENTION_BY_ID = new Map(
  CONVENTIONS.map((convention) => [convention.id, convention]),
)
