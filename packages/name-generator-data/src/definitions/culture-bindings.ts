import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { akanPersonalDefinition } from './akan/personal'
import { dragonbornClanDefinition } from './dragonborn/clan'
import { dragonbornPersonalDefinition } from './dragonborn/personal'
import { dwarfPersonalDefinition } from './dwarf/personal'
import { dwarfSettlementDefinition } from './dwarf/settlement'
import { elvenPersonalDefinition } from './elven/personal'
import { elvenSettlementDefinition } from './elven/settlement'
import { gnomePersonalDefinition } from './gnome/personal'
import { gnomeSettlementDefinition } from './gnome/settlement'
import { goliathPersonalDefinition } from './goliath/personal'
import { halflingPersonalDefinition } from './halfling/personal'
import { halflingSettlementDefinition } from './halfling/settlement'
import { orcPersonalDefinition } from './orc/personal'
import { tieflingPersonalDefinition } from './tiefling/personal'

export const CULTURE_CONVENTION_BINDINGS = {
  akan: [akanPersonalDefinition],
  dragonborn: [dragonbornPersonalDefinition, dragonbornClanDefinition],
  dwarf: [dwarfPersonalDefinition, dwarfSettlementDefinition],
  elven: [elvenPersonalDefinition, elvenSettlementDefinition],
  gnome: [gnomePersonalDefinition, gnomeSettlementDefinition],
  goliath: [goliathPersonalDefinition],
  halfling: [halflingPersonalDefinition, halflingSettlementDefinition],
  orc: [orcPersonalDefinition],
  tiefling: [tieflingPersonalDefinition],
} as const satisfies Record<string, readonly NamingConventionDefinition[]>
