import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Abilities — the six creature ability scores (shared by classes, monsters,
// and characters). `class.ts` references ability *ids* only, not scores.
// ---------------------------------------------------------------------------

export const ABILITY_ENTRIES = {
  str: {
    label: 'Strength',
    description: 'Physical might',
  },
  dex: {
    label: 'Dexterity',
    description: 'Agility, reflexes, and balance',
  },
  con: {
    label: 'Constitution',
    description: 'Health and stamina',
  },
  int: {
    label: 'Intelligence',
    description: 'Reasoning and memory',
  },
  wis: {
    label: 'Wisdom',
    description: 'Perceptiveness and mental fortitude',
  },
  cha: {
    label: 'Charisma',
    description: 'Force of personality',
  },
} as const satisfies Record<string, GameTermEntry>

export type Ability = keyof typeof ABILITY_ENTRIES

export const ABILITY_IDS = Object.keys(ABILITY_ENTRIES) as [Ability, ...Ability[]]

export const abilitySchema = z.enum(ABILITY_IDS)

/** Standard spellcasting abilities (INT / WIS / CHA). */
export const COMMON_SPELLCASTING_ABILITY_IDS = ['int', 'wis', 'cha'] as const satisfies readonly Ability[]

/** Unusual spellcasting abilities (STR / DEX / CON) for homebrew or edge cases. */
export const ADVANCED_SPELLCASTING_ABILITY_IDS = ['str', 'dex', 'con'] as const satisfies readonly Ability[]

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
    message: `Ability score must not exceed ${CHARACTER_ABILITY_SCORE_MAX}`,
  },
)
