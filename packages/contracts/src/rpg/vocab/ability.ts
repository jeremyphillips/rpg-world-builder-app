import { z } from 'zod'

import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry } from './types'
import { abilityValidationMessages } from './ability-messages'

// ---------------------------------------------------------------------------
// Abilities — the six creature ability scores (shared by classes, monsters,
// and characters). `class.ts` references ability *ids* only, not scores.
// ---------------------------------------------------------------------------

export const ABILITY_ENTRIES = {
  str: {
    label: 'Strength',
    description: 'Physical might',
    sentence: {
      singular: 'strength',
      plural: 'strength',
    },
  },
  dex: {
    label: 'Dexterity',
    description: 'Agility, reflexes, and balance',
    sentence: {
      singular: 'dexterity',
      plural: 'dexterity',
    },
  },
  con: {
    label: 'Constitution',
    description: 'Health and stamina',
    sentence: {
      singular: 'constitution',
      plural: 'constitution',
    },
  },
  int: {
    label: 'Intelligence',
    description: 'Reasoning and memory',
    sentence: {
      singular: 'intelligence',
      plural: 'intelligence',
    },
  },
  wis: {
    label: 'Wisdom',
    description: 'Perceptiveness and mental fortitude',
    sentence: {
      singular: 'wisdom',
      plural: 'wisdom',
    },
  },
  cha: {
    label: 'Charisma',
    description: 'Force of personality',
    sentence: {
      singular: 'charisma',
      plural: 'charisma',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type Ability = keyof typeof ABILITY_ENTRIES

export const ABILITY_IDS = keysFromEntries(ABILITY_ENTRIES)

export const abilitySchema = vocabEnumFromEntries(ABILITY_ENTRIES)

/** Standard spellcasting abilities (INT / WIS / CHA). */
export const COMMON_SPELLCASTING_ABILITY_IDS = [
  'int',
  'wis',
  'cha',
] as const satisfies readonly Ability[]

/** Unusual spellcasting abilities (STR / DEX / CON) for homebrew or edge cases. */
export const ADVANCED_SPELLCASTING_ABILITY_IDS = [
  'str',
  'dex',
  'con',
] as const satisfies readonly Ability[]

export const SPELLCASTING_ABILITY_GROUP_LABELS = {
  common: 'Common',
  advanced: 'Advanced',
} as const

export type SpellcastingAbilityOptionGroup = {
  label: string
  options: { value: string; label: string }[]
}

function spellcastingAbilityOptionsForIds(
  ids: readonly Ability[],
): SpellcastingAbilityOptionGroup['options'] {
  return ids.map((id) => ({ value: id, label: ABILITY_ENTRIES[id].label }))
}

/** Grouped spellcasting ability options for authoring selects. */
export function buildGroupedSpellcastingAbilityOptions(): SpellcastingAbilityOptionGroup[] {
  return [
    {
      label: SPELLCASTING_ABILITY_GROUP_LABELS.common,
      options: spellcastingAbilityOptionsForIds(COMMON_SPELLCASTING_ABILITY_IDS),
    },
    {
      label: SPELLCASTING_ABILITY_GROUP_LABELS.advanced,
      options: spellcastingAbilityOptionsForIds(ADVANCED_SPELLCASTING_ABILITY_IDS),
    },
  ]
}

/** Returns the reference entry for an ability id, if known. */
export function getAbilityEntry(id: string): GameTermEntry | undefined {
  return ABILITY_ENTRIES[id as Ability]
}

/** Returns the display label for an ability id. Falls back to the raw value. */
export function getAbilityLabel(id: string): string {
  return getAbilityEntry(id)?.label ?? id
}

/** Lowercase ability phrase for generated prose (e.g. spellcasting ability text). */
export function getAbilitySentenceForm(id: string, count = 1): string {
  const entry = getAbilityEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
}

// ---------------------------------------------------------------------------
// Ability scores — bounds are context-dependent: character sheets (PC and NPC)
// cap at 20; monsters reach ~30. Groundwork for character/monster sheets; not
// used by class.ts.
// ---------------------------------------------------------------------------

export const ABILITY_SCORE_MIN = 1
export const CHARACTER_ABILITY_SCORE_MAX = 20
export const ABILITY_SCORE_MAX = 30

export const abilityScoreSchema = z.number().int().min(ABILITY_SCORE_MIN).max(ABILITY_SCORE_MAX)

export const characterAbilityScoreSchema = abilityScoreSchema.refine(
  (n) => n <= CHARACTER_ABILITY_SCORE_MAX,
  {
    message: abilityValidationMessages.characterScoreMaxExceeded({
      max: CHARACTER_ABILITY_SCORE_MAX,
    }),
  },
)
