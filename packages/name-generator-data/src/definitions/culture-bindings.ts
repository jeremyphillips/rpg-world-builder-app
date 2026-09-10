import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { akanFamilyDefinition } from './culture/akan/family'
import { akanPersonalDefinition } from './culture/akan/personal'
import { dragonbornChromaticPersonalDefinition } from './culture/dragonborn-chromatic/personal'
import { dragonbornMetallicPersonalDefinition } from './culture/dragonborn-metallic/personal'
import { elvenDrowPersonalDefinition } from './culture/elven-drow/personal'
import { elvenHighPersonalDefinition } from './culture/elven-high/personal'
import { elvenWoodPersonalDefinition } from './culture/elven-wood/personal'
import { elvenFactionDefinition } from './culture/elven/faction'
import { elvenFamilyDefinition } from './culture/elven/family'
import { elvenLandmarkDefinition } from './culture/elven/landmark'
import { elvenPersonalDefinition } from './culture/elven/personal'
import { elvenSettlementDefinition } from './culture/elven/settlement'
import { tieflingAbyssalPersonalDefinition } from './culture/tiefling-abyssal/personal'
import { tieflingChthonicPersonalDefinition } from './culture/tiefling-chthonic/personal'
import { dragonbornClanDefinition } from './species/dragonborn/clan'
import { dragonbornLandmarkDefinition } from './species/dragonborn/landmark'
import { dragonbornPersonalDefinition } from './species/dragonborn/personal'
import { dragonbornSettlementDefinition } from './species/dragonborn/settlement'
import { dwarfClanDefinition } from './species/dwarf/clan'
import { dwarfFactionDefinition } from './species/dwarf/faction'
import { dwarfLandmarkDefinition } from './species/dwarf/landmark'
import { dwarfPersonalDefinition } from './species/dwarf/personal'
import { dwarfSettlementDefinition } from './species/dwarf/settlement'
import { gnomeFamilyDefinition } from './species/gnome/family'
import { gnomeLandmarkDefinition } from './species/gnome/landmark'
import { gnomePersonalDefinition } from './species/gnome/personal'
import { gnomeSettlementDefinition } from './species/gnome/settlement'
import { goliathClanDefinition } from './species/goliath/clan'
import { goliathLandmarkDefinition } from './species/goliath/landmark'
import { goliathPersonalDefinition } from './species/goliath/personal'
import { goliathSettlementDefinition } from './species/goliath/settlement'
import { halflingFamilyDefinition } from './species/halfling/family'
import { halflingLandmarkDefinition } from './species/halfling/landmark'
import { halflingPersonalDefinition } from './species/halfling/personal'
import { halflingSettlementDefinition } from './species/halfling/settlement'
import { humanFamilyDefinition } from './species/human/family'
import { humanLandmarkDefinition } from './species/human/landmark'
import { humanPersonalDefinition } from './species/human/personal'
import { humanSettlementDefinition } from './species/human/settlement'
import { orcLandmarkDefinition } from './species/orc/landmark'
import { orcPersonalDefinition } from './species/orc/personal'
import { orcSettlementDefinition } from './species/orc/settlement'
import { tieflingLandmarkDefinition } from './species/tiefling/landmark'
import { tieflingPersonalDefinition } from './species/tiefling/personal'
import { tieflingSettlementDefinition } from './species/tiefling/settlement'

export const CULTURE_CONVENTION_BINDINGS = {
  akan: [akanPersonalDefinition, akanFamilyDefinition],
  dragonborn: [
    dragonbornPersonalDefinition,
    dragonbornClanDefinition,
    dragonbornSettlementDefinition,
    dragonbornLandmarkDefinition,
  ],
  'dragonborn-chromatic': [dragonbornChromaticPersonalDefinition],
  'dragonborn-metallic': [dragonbornMetallicPersonalDefinition],
  dwarf: [
    dwarfPersonalDefinition,
    dwarfSettlementDefinition,
    dwarfClanDefinition,
    dwarfLandmarkDefinition,
    dwarfFactionDefinition,
  ],
  elven: [
    elvenPersonalDefinition,
    elvenSettlementDefinition,
    elvenFamilyDefinition,
    elvenLandmarkDefinition,
    elvenFactionDefinition,
  ],
  'elven-drow': [elvenDrowPersonalDefinition],
  'elven-high': [elvenHighPersonalDefinition],
  'elven-wood': [elvenWoodPersonalDefinition],
  gnome: [
    gnomePersonalDefinition,
    gnomeSettlementDefinition,
    gnomeFamilyDefinition,
    gnomeLandmarkDefinition,
  ],
  goliath: [
    goliathPersonalDefinition,
    goliathClanDefinition,
    goliathSettlementDefinition,
    goliathLandmarkDefinition,
  ],
  halfling: [
    halflingPersonalDefinition,
    halflingSettlementDefinition,
    halflingFamilyDefinition,
    halflingLandmarkDefinition,
  ],
  human: [
    humanPersonalDefinition,
    humanFamilyDefinition,
    humanSettlementDefinition,
    humanLandmarkDefinition,
  ],
  orc: [orcPersonalDefinition, orcSettlementDefinition, orcLandmarkDefinition],
  tiefling: [tieflingPersonalDefinition, tieflingSettlementDefinition, tieflingLandmarkDefinition],
  'tiefling-abyssal': [tieflingAbyssalPersonalDefinition],
  'tiefling-chthonic': [tieflingChthonicPersonalDefinition],
} as const satisfies Record<string, readonly NamingConventionDefinition[]>
