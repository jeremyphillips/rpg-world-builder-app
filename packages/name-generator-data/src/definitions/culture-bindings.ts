import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { akanFamilyDefinition } from './culture/akan/family'
import { akanPersonalDefinition } from './culture/akan/personal'
import { angloSaxonLandmarkDefinition } from './culture/anglo-saxon/landmark'
import { angloSaxonPersonalDefinition } from './culture/anglo-saxon/personal'
import { angloSaxonSettlementDefinition } from './culture/anglo-saxon/settlement'
import { arabicFamilyDefinition } from './culture/arabic/family'
import { arabicLandmarkDefinition } from './culture/arabic/landmark'
import { arabicPersonalDefinition } from './culture/arabic/personal'
import { arabicSettlementDefinition } from './culture/arabic/settlement'
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
import { gaelicFamilyDefinition } from './culture/gaelic/family'
import { gaelicLandmarkDefinition } from './culture/gaelic/landmark'
import { gaelicPersonalDefinition } from './culture/gaelic/personal'
import { gaelicSettlementDefinition } from './culture/gaelic/settlement'
import { hanChineseFamilyDefinition } from './culture/han-chinese/family'
import { hanChineseLandmarkDefinition } from './culture/han-chinese/landmark'
import { hanChinesePersonalDefinition } from './culture/han-chinese/personal'
import { hanChineseSettlementDefinition } from './culture/han-chinese/settlement'
import { japaneseFamilyDefinition } from './culture/japanese/family'
import { japaneseLandmarkDefinition } from './culture/japanese/landmark'
import { japanesePersonalDefinition } from './culture/japanese/personal'
import { japaneseSettlementDefinition } from './culture/japanese/settlement'
import { norsePersonalDefinition } from './culture/norse/personal'
import { romanFamilyDefinition } from './culture/roman/family'
import { romanLandmarkDefinition } from './culture/roman/landmark'
import { romanPersonalDefinition } from './culture/roman/personal'
import { romanSettlementDefinition } from './culture/roman/settlement'
import { slavicFamilyDefinition } from './culture/slavic/family'
import { slavicLandmarkDefinition } from './culture/slavic/landmark'
import { slavicPersonalDefinition } from './culture/slavic/personal'
import { slavicSettlementDefinition } from './culture/slavic/settlement'
import { tieflingAbyssalPersonalDefinition } from './culture/tiefling-abyssal/personal'
import { tieflingChthonicPersonalDefinition } from './culture/tiefling-chthonic/personal'
import { yorubaFamilyDefinition } from './culture/yoruba/family'
import { yorubaLandmarkDefinition } from './culture/yoruba/landmark'
import { yorubaPersonalDefinition } from './culture/yoruba/personal'
import { yorubaSettlementDefinition } from './culture/yoruba/settlement'
import { dragonbornClanDefinition } from './species/dragonborn/clan'
import { dragonbornFactionDefinition } from './species/dragonborn/faction'
import { dragonbornLandmarkDefinition } from './species/dragonborn/landmark'
import { dragonbornPersonalDefinition } from './species/dragonborn/personal'
import { dragonbornSettlementDefinition } from './species/dragonborn/settlement'
import { dwarfClanDefinition } from './species/dwarf/clan'
import { dwarfFactionDefinition } from './species/dwarf/faction'
import { dwarfLandmarkDefinition } from './species/dwarf/landmark'
import { dwarfPersonalDefinition } from './species/dwarf/personal'
import { dwarfSettlementDefinition } from './species/dwarf/settlement'
import { gnomeFactionDefinition } from './species/gnome/faction'
import { gnomeFamilyDefinition } from './species/gnome/family'
import { gnomeLandmarkDefinition } from './species/gnome/landmark'
import { gnomePersonalDefinition } from './species/gnome/personal'
import { gnomeSettlementDefinition } from './species/gnome/settlement'
import { goliathClanDefinition } from './species/goliath/clan'
import { goliathFactionDefinition } from './species/goliath/faction'
import { goliathLandmarkDefinition } from './species/goliath/landmark'
import { goliathPersonalDefinition } from './species/goliath/personal'
import { goliathSettlementDefinition } from './species/goliath/settlement'
import { halflingFactionDefinition } from './species/halfling/faction'
import { halflingFamilyDefinition } from './species/halfling/family'
import { halflingLandmarkDefinition } from './species/halfling/landmark'
import { halflingPersonalDefinition } from './species/halfling/personal'
import { halflingSettlementDefinition } from './species/halfling/settlement'
import { humanFactionDefinition } from './species/human/faction'
import { humanFamilyDefinition } from './species/human/family'
import { humanLandmarkDefinition } from './species/human/landmark'
import { humanPersonalDefinition } from './species/human/personal'
import { humanSettlementDefinition } from './species/human/settlement'
import { orcClanDefinition } from './species/orc/clan'
import { orcFactionDefinition } from './species/orc/faction'
import { orcLandmarkDefinition } from './species/orc/landmark'
import { orcPersonalDefinition } from './species/orc/personal'
import { orcSettlementDefinition } from './species/orc/settlement'
import { tieflingFactionDefinition } from './species/tiefling/faction'
import { tieflingFamilyDefinition } from './species/tiefling/family'
import { tieflingLandmarkDefinition } from './species/tiefling/landmark'
import { tieflingPersonalDefinition } from './species/tiefling/personal'
import { tieflingSettlementDefinition } from './species/tiefling/settlement'

export const CULTURE_CONVENTION_BINDINGS = {
  akan: [akanPersonalDefinition, akanFamilyDefinition],
  'anglo-saxon': [
    angloSaxonPersonalDefinition,
    angloSaxonSettlementDefinition,
    angloSaxonLandmarkDefinition,
  ],
  arabic: [
    arabicPersonalDefinition,
    arabicFamilyDefinition,
    arabicSettlementDefinition,
    arabicLandmarkDefinition,
  ],
  dragonborn: [
    dragonbornPersonalDefinition,
    dragonbornClanDefinition,
    dragonbornSettlementDefinition,
    dragonbornLandmarkDefinition,
    dragonbornFactionDefinition,
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
  gaelic: [
    gaelicPersonalDefinition,
    gaelicFamilyDefinition,
    gaelicSettlementDefinition,
    gaelicLandmarkDefinition,
  ],
  gnome: [
    gnomePersonalDefinition,
    gnomeSettlementDefinition,
    gnomeFamilyDefinition,
    gnomeLandmarkDefinition,
    gnomeFactionDefinition,
  ],
  goliath: [
    goliathPersonalDefinition,
    goliathClanDefinition,
    goliathSettlementDefinition,
    goliathLandmarkDefinition,
    goliathFactionDefinition,
  ],
  halfling: [
    halflingPersonalDefinition,
    halflingSettlementDefinition,
    halflingFamilyDefinition,
    halflingLandmarkDefinition,
    halflingFactionDefinition,
  ],
  'han-chinese': [
    hanChinesePersonalDefinition,
    hanChineseFamilyDefinition,
    hanChineseSettlementDefinition,
    hanChineseLandmarkDefinition,
  ],
  human: [
    humanPersonalDefinition,
    humanFamilyDefinition,
    humanSettlementDefinition,
    humanLandmarkDefinition,
    humanFactionDefinition,
  ],
  japanese: [
    japanesePersonalDefinition,
    japaneseFamilyDefinition,
    japaneseSettlementDefinition,
    japaneseLandmarkDefinition,
  ],
  norse: [norsePersonalDefinition],
  orc: [
    orcPersonalDefinition,
    orcSettlementDefinition,
    orcLandmarkDefinition,
    orcClanDefinition,
    orcFactionDefinition,
  ],
  roman: [
    romanPersonalDefinition,
    romanFamilyDefinition,
    romanSettlementDefinition,
    romanLandmarkDefinition,
  ],
  slavic: [
    slavicPersonalDefinition,
    slavicFamilyDefinition,
    slavicSettlementDefinition,
    slavicLandmarkDefinition,
  ],
  tiefling: [
    tieflingPersonalDefinition,
    tieflingSettlementDefinition,
    tieflingLandmarkDefinition,
    tieflingFamilyDefinition,
    tieflingFactionDefinition,
  ],
  'tiefling-abyssal': [tieflingAbyssalPersonalDefinition],
  'tiefling-chthonic': [tieflingChthonicPersonalDefinition],
  yoruba: [
    yorubaPersonalDefinition,
    yorubaFamilyDefinition,
    yorubaSettlementDefinition,
    yorubaLandmarkDefinition,
  ],
} as const satisfies Record<string, readonly NamingConventionDefinition[]>
