import { z } from 'zod'
import {
  ATTACK_RESOLUTION_MODE_SET_ID,
  CREATURE_TYPE_SET_ID,
  DAMAGE_TYPE_SET_ID,
  EDITION_PRESET_SET_ID,
  LANGUAGE_SET_ID,
  SENSE_SET_ID,
  SPELL_SCHOOL_SET_ID,
  languageSeedOptionSchema,
  vocabularySeedOptionSchema,
} from '@rpg/contracts'
import type {
  LanguageCategory,
  LanguageSeedOption,
  SystemRulesetId,
  VocabularyOption,
  VocabularyOptionSet,
  VocabularyOptionSetId,
  VocabularySeedOption,
} from '@rpg/contracts'

import { getById } from '../lib/get-by-id'
import attackResolutionModesRaw from './data/srd-cc-5.2.1/attack-resolution-modes.json'
import creatureTypesRaw from './data/srd-cc-5.2.1/creature-types.json'
import damageTypesRaw from './data/srd-cc-5.2.1/damage-types.json'
import editionPresetsRaw from './data/srd-cc-5.2.1/edition-presets.json'
import languagesRaw from './data/srd-cc-5.2.1/languages.json'
import sensesRaw from './data/srd-cc-5.2.1/senses.json'
import spellSchoolsRaw from './data/srd-cc-5.2.1/spell-schools.json'

function assertUniqueOptionIds(options: readonly VocabularySeedOption[], label: string): void {
  const ids = options.map((option) => option.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${label}: duplicate vocabulary option ids`)
  }
}

function parseSeedOptions(raw: unknown, label: string): VocabularySeedOption[] {
  const options = z.array(vocabularySeedOptionSchema).parse(raw)
  assertUniqueOptionIds(options, label)
  return options
}

function parseLanguageSeedOptions(raw: unknown, label: string): LanguageSeedOption[] {
  const options = z.array(languageSeedOptionSchema).parse(raw)
  assertUniqueOptionIds(options, label)
  return options
}

// Validate the shipped catalog against the contract at module load so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_CREATURE_TYPES = parseSeedOptions(creatureTypesRaw, CREATURE_TYPE_SET_ID)
const SRD_521_DAMAGE_TYPES = parseSeedOptions(damageTypesRaw, DAMAGE_TYPE_SET_ID)
const SRD_521_SENSES = parseSeedOptions(sensesRaw, SENSE_SET_ID)
const SRD_521_LANGUAGES = parseLanguageSeedOptions(languagesRaw, LANGUAGE_SET_ID)
const SRD_521_SPELL_SCHOOLS = parseSeedOptions(spellSchoolsRaw, SPELL_SCHOOL_SET_ID)
const SRD_521_EDITION_PRESETS = parseSeedOptions(editionPresetsRaw, EDITION_PRESET_SET_ID)
const SRD_521_ATTACK_RESOLUTION_MODES = parseSeedOptions(
  attackResolutionModesRaw,
  ATTACK_RESOLUTION_MODE_SET_ID,
)

const SEED_SETS_BY_RULESET = {
  'srd-cc-5.2.1': {
    [CREATURE_TYPE_SET_ID]: SRD_521_CREATURE_TYPES,
    [DAMAGE_TYPE_SET_ID]: SRD_521_DAMAGE_TYPES,
    [SENSE_SET_ID]: SRD_521_SENSES,
    [LANGUAGE_SET_ID]: SRD_521_LANGUAGES,
    [SPELL_SCHOOL_SET_ID]: SRD_521_SPELL_SCHOOLS,
    [EDITION_PRESET_SET_ID]: SRD_521_EDITION_PRESETS,
    [ATTACK_RESOLUTION_MODE_SET_ID]: SRD_521_ATTACK_RESOLUTION_MODES,
  },
} as const satisfies Record<
  SystemRulesetId,
  Partial<Record<VocabularyOptionSetId, readonly VocabularySeedOption[]>>
>

function toResolvedSet(
  setId: VocabularyOptionSetId,
  seeds: readonly VocabularySeedOption[],
): VocabularyOptionSet {
  return {
    id: setId,
    options: seeds.map((seed) => ({
      id: seed.id,
      label: seed.label,
      description: seed.description,
      source: 'system',
      status: 'active',
    })),
  }
}

function loadSeedOptions(
  rulesetId: SystemRulesetId,
  setId: VocabularyOptionSetId,
): readonly VocabularySeedOption[] {
  const sets = SEED_SETS_BY_RULESET[rulesetId] as Partial<
    Record<VocabularyOptionSetId, readonly VocabularySeedOption[]>
  >
  const seeds = sets[setId]
  if (seeds === undefined) {
    throw new Error(`Vocabulary set "${setId}" not found for ruleset "${rulesetId}"`)
  }
  return seeds
}

/** Loads one system vocabulary option set for a ruleset. */
export function loadSeedVocabularyOptionSet(
  rulesetId: SystemRulesetId,
  setId: VocabularyOptionSetId,
): VocabularyOptionSet {
  return toResolvedSet(setId, loadSeedOptions(rulesetId, setId))
}

/** System vocabulary option ids for a ruleset set — used by slug guards and filters. */
export function seedVocabularyOptionIds(
  rulesetId: SystemRulesetId,
  setId: VocabularyOptionSetId,
): ReadonlySet<string> {
  return new Set(loadSeedOptions(rulesetId, setId).map((option) => option.id))
}

export function getVocabularyOptionById(
  rulesetId: SystemRulesetId,
  setId: VocabularyOptionSetId,
  id: string,
): VocabularyOption {
  const set = loadSeedVocabularyOptionSet(rulesetId, setId)
  return getById(set.options, rulesetId, setId, id, 'Vocabulary option')
}

/** Seed label lookup — falls back to the raw id when unknown. */
export function getSeedVocabularyOptionLabel(
  rulesetId: SystemRulesetId,
  setId: VocabularyOptionSetId,
  id: string,
): string {
  try {
    return getVocabularyOptionById(rulesetId, setId, id).label
  } catch {
    return id
  }
}

// ---------------------------------------------------------------------------
// Creature types — first shipped vocabulary set
// ---------------------------------------------------------------------------

export const CREATURE_TYPES = SRD_521_CREATURE_TYPES.map((option) => option.id) as [
  (typeof SRD_521_CREATURE_TYPES)[number]['id'],
  ...(typeof SRD_521_CREATURE_TYPES)[number]['id'][],
]

export type SeedCreatureType = (typeof CREATURE_TYPES)[number]

export function loadSeedCreatureTypes(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, CREATURE_TYPE_SET_ID)
}

export function seedCreatureTypeIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, CREATURE_TYPE_SET_ID)
}

export function getSeedCreatureTypeLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, CREATURE_TYPE_SET_ID, id)
}

export function getSeedCreatureTypeEntry(
  rulesetId: SystemRulesetId,
  id: string,
): VocabularySeedOption | undefined {
  try {
    return getById(
      loadSeedOptions(rulesetId, CREATURE_TYPE_SET_ID),
      rulesetId,
      CREATURE_TYPE_SET_ID,
      id,
      'Creature type',
    )
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Damage types — elemental + planar vocabulary (physical types stay closed)
// ---------------------------------------------------------------------------

export const DAMAGE_TYPES = SRD_521_DAMAGE_TYPES.map((option) => option.id) as [
  (typeof SRD_521_DAMAGE_TYPES)[number]['id'],
  ...(typeof SRD_521_DAMAGE_TYPES)[number]['id'][],
]

export type SeedDamageType = (typeof DAMAGE_TYPES)[number]

export function loadSeedDamageTypes(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, DAMAGE_TYPE_SET_ID)
}

export function seedDamageTypeIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, DAMAGE_TYPE_SET_ID)
}

export function getSeedDamageTypeLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, DAMAGE_TYPE_SET_ID, id)
}

export function getSeedDamageTypeEntry(
  rulesetId: SystemRulesetId,
  id: string,
): VocabularySeedOption | undefined {
  try {
    return getById(
      loadSeedOptions(rulesetId, DAMAGE_TYPE_SET_ID),
      rulesetId,
      DAMAGE_TYPE_SET_ID,
      id,
      'Damage type',
    )
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Senses — open vocabulary set
// ---------------------------------------------------------------------------

export const SENSES = SRD_521_SENSES.map((option) => option.id) as [
  (typeof SRD_521_SENSES)[number]['id'],
  ...(typeof SRD_521_SENSES)[number]['id'][],
]

export type SeedSense = (typeof SENSES)[number]

export function loadSeedSenses(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, SENSE_SET_ID)
}

export function seedSenseIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, SENSE_SET_ID)
}

export function getSeedSenseLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, SENSE_SET_ID, id)
}

export function getSeedSenseEntry(
  rulesetId: SystemRulesetId,
  id: string,
): VocabularySeedOption | undefined {
  try {
    return getById(loadSeedOptions(rulesetId, SENSE_SET_ID), rulesetId, SENSE_SET_ID, id, 'Sense')
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Languages — open vocabulary with standard/rare category on seed rows
// ---------------------------------------------------------------------------

export const LANGUAGES = SRD_521_LANGUAGES.map((option) => option.id) as [
  (typeof SRD_521_LANGUAGES)[number]['id'],
  ...(typeof SRD_521_LANGUAGES)[number]['id'][],
]

export type SeedLanguage = (typeof LANGUAGES)[number]

function loadLanguageSeedOptions(rulesetId: SystemRulesetId): readonly LanguageSeedOption[] {
  const seeds = SEED_SETS_BY_RULESET[rulesetId][LANGUAGE_SET_ID]
  if (seeds === undefined) {
    throw new Error(`Vocabulary set "${LANGUAGE_SET_ID}" not found for ruleset "${rulesetId}"`)
  }
  return seeds
}

export function loadSeedLanguages(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, LANGUAGE_SET_ID)
}

export function seedLanguageIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, LANGUAGE_SET_ID)
}

export function seedLanguageIdsByCategory(
  rulesetId: SystemRulesetId,
  category: LanguageCategory,
): readonly string[] {
  return loadLanguageSeedOptions(rulesetId)
    .filter((option) => option.category === category)
    .map((option) => option.id)
}

export function getSeedLanguageLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, LANGUAGE_SET_ID, id)
}

export function getSeedLanguageCategory(
  rulesetId: SystemRulesetId,
  id: string,
): LanguageCategory | undefined {
  return getSeedLanguageEntry(rulesetId, id)?.category
}

export function getSeedLanguageEntry(
  rulesetId: SystemRulesetId,
  id: string,
): LanguageSeedOption | undefined {
  try {
    return getById(loadLanguageSeedOptions(rulesetId), rulesetId, LANGUAGE_SET_ID, id, 'Language')
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Spell schools — open vocabulary set
// ---------------------------------------------------------------------------

export const SPELL_SCHOOLS = SRD_521_SPELL_SCHOOLS.map((option) => option.id) as [
  (typeof SRD_521_SPELL_SCHOOLS)[number]['id'],
  ...(typeof SRD_521_SPELL_SCHOOLS)[number]['id'][],
]

export type SeedSpellSchool = (typeof SPELL_SCHOOLS)[number]

export function loadSeedSpellSchools(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, SPELL_SCHOOL_SET_ID)
}

export function seedSpellSchoolIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, SPELL_SCHOOL_SET_ID)
}

export function getSeedSpellSchoolLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, SPELL_SCHOOL_SET_ID, id)
}

export function getSeedSpellSchoolEntry(
  rulesetId: SystemRulesetId,
  id: string,
): VocabularySeedOption | undefined {
  try {
    return getById(
      loadSeedOptions(rulesetId, SPELL_SCHOOL_SET_ID),
      rulesetId,
      SPELL_SCHOOL_SET_ID,
      id,
      'Spell school',
    )
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Edition presets — internal mechanics vocabulary
// ---------------------------------------------------------------------------

export const EDITION_PRESETS = SRD_521_EDITION_PRESETS.map((option) => option.id) as [
  (typeof SRD_521_EDITION_PRESETS)[number]['id'],
  ...(typeof SRD_521_EDITION_PRESETS)[number]['id'][],
]

export type SeedEditionPreset = (typeof EDITION_PRESETS)[number]

export function loadSeedEditionPresets(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, EDITION_PRESET_SET_ID)
}

export function seedEditionPresetIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, EDITION_PRESET_SET_ID)
}

export function getSeedEditionPresetLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, EDITION_PRESET_SET_ID, id)
}

export function getSeedEditionPresetEntry(
  rulesetId: SystemRulesetId,
  id: string,
): VocabularySeedOption | undefined {
  try {
    return getById(
      loadSeedOptions(rulesetId, EDITION_PRESET_SET_ID),
      rulesetId,
      EDITION_PRESET_SET_ID,
      id,
      'Edition preset',
    )
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Attack resolution modes — internal mechanics vocabulary
// ---------------------------------------------------------------------------

export const ATTACK_RESOLUTION_MODES = SRD_521_ATTACK_RESOLUTION_MODES.map(
  (option) => option.id,
) as [
  (typeof SRD_521_ATTACK_RESOLUTION_MODES)[number]['id'],
  ...(typeof SRD_521_ATTACK_RESOLUTION_MODES)[number]['id'][],
]

export type SeedAttackResolutionMode = (typeof ATTACK_RESOLUTION_MODES)[number]

export function loadSeedAttackResolutionModes(rulesetId: SystemRulesetId): VocabularyOptionSet {
  return loadSeedVocabularyOptionSet(rulesetId, ATTACK_RESOLUTION_MODE_SET_ID)
}

export function seedAttackResolutionModeIds(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return seedVocabularyOptionIds(rulesetId, ATTACK_RESOLUTION_MODE_SET_ID)
}

export function getSeedAttackResolutionModeLabel(rulesetId: SystemRulesetId, id: string): string {
  return getSeedVocabularyOptionLabel(rulesetId, ATTACK_RESOLUTION_MODE_SET_ID, id)
}

export function getSeedAttackResolutionModeEntry(
  rulesetId: SystemRulesetId,
  id: string,
): VocabularySeedOption | undefined {
  try {
    return getById(
      loadSeedOptions(rulesetId, ATTACK_RESOLUTION_MODE_SET_ID),
      rulesetId,
      ATTACK_RESOLUTION_MODE_SET_ID,
      id,
      'Attack resolution mode',
    )
  } catch {
    return undefined
  }
}

/** Vocabulary set ids with catalog seed data for a ruleset. */
export function listSeedVocabularySetIds(rulesetId: SystemRulesetId): VocabularyOptionSetId[] {
  const sets = SEED_SETS_BY_RULESET[rulesetId] as Partial<
    Record<VocabularyOptionSetId, readonly VocabularySeedOption[]>
  >
  return Object.keys(sets) as VocabularyOptionSetId[]
}
