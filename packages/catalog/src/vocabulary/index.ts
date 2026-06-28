import { z } from 'zod'
import {
  ATTACK_RESOLUTION_MODE_SET_ID,
  CREATURE_TYPE_SET_ID,
  EDITION_PRESET_SET_ID,
  vocabularySeedOptionSchema,
} from '@rpg/contracts'
import type {
  SystemRulesetId,
  VocabularyOption,
  VocabularyOptionSet,
  VocabularyOptionSetId,
  VocabularySeedOption,
} from '@rpg/contracts'

import { getById } from '../lib/get-by-id'
import attackResolutionModesRaw from './data/srd-cc-5.2.1/attack-resolution-modes.json'
import creatureTypesRaw from './data/srd-cc-5.2.1/creature-types.json'
import editionPresetsRaw from './data/srd-cc-5.2.1/edition-presets.json'

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

// Validate the shipped catalog against the contract at module load so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_CREATURE_TYPES = parseSeedOptions(creatureTypesRaw, CREATURE_TYPE_SET_ID)
const SRD_521_EDITION_PRESETS = parseSeedOptions(editionPresetsRaw, EDITION_PRESET_SET_ID)
const SRD_521_ATTACK_RESOLUTION_MODES = parseSeedOptions(
  attackResolutionModesRaw,
  ATTACK_RESOLUTION_MODE_SET_ID,
)

const SEED_SETS_BY_RULESET = {
  'srd-cc-5.2.1': {
    [CREATURE_TYPE_SET_ID]: SRD_521_CREATURE_TYPES,
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
