import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { akanPersonalDefinition } from './culture/akan/personal'
import { elvenPersonalDefinition } from './culture/elven/personal'
import { elvenSettlementDefinition } from './culture/elven/settlement'
import { dragonbornClanDefinition } from './species/dragonborn/clan'
import { dragonbornPersonalDefinition } from './species/dragonborn/personal'
import { dwarfPersonalDefinition } from './species/dwarf/personal'
import { dwarfSettlementDefinition } from './species/dwarf/settlement'
import { gnomePersonalDefinition } from './species/gnome/personal'
import { gnomeSettlementDefinition } from './species/gnome/settlement'
import { goliathPersonalDefinition } from './species/goliath/personal'
import { halflingPersonalDefinition } from './species/halfling/personal'
import { humanPersonalDefinition } from './species/human/personal'
import { halflingSettlementDefinition } from './species/halfling/settlement'
import { orcPersonalDefinition } from './species/orc/personal'
import { tieflingPersonalDefinition } from './species/tiefling/personal'

export const CULTURE_CONVENTION_BINDINGS = {
  akan: [akanPersonalDefinition],
  dragonborn: [dragonbornPersonalDefinition, dragonbornClanDefinition],
  dwarf: [dwarfPersonalDefinition, dwarfSettlementDefinition],
  elven: [elvenPersonalDefinition, elvenSettlementDefinition],
  gnome: [gnomePersonalDefinition, gnomeSettlementDefinition],
  goliath: [goliathPersonalDefinition],
  halfling: [halflingPersonalDefinition, halflingSettlementDefinition],
  human: [humanPersonalDefinition],
  orc: [orcPersonalDefinition],
  tiefling: [tieflingPersonalDefinition],
} as const satisfies Record<string, readonly NamingConventionDefinition[]>
