import { getContentTypeTerm } from '../primitives/content/content-type-terms'
import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Monster action kinds — discriminant for stat-block action variants.
// ---------------------------------------------------------------------------

export const MONSTER_ACTION_KIND_TERM = {
  label: 'Monster Action Kind',
  description:
    'Whether a monster action uses equipment, a natural weapon, an authored attack, a saving throw, a multiattack, a reference, a parry, a leap, a teleport, a set of standard actions, special prose, or referenced spells.',
  sentence: {
    singular: 'monster action kind',
    plural: 'monster action kinds',
  },
} as const satisfies VocabularyTerm

export const MONSTER_ACTION_KIND_ENTRIES = {
  weapon: {
    label: 'Weapon',
    description: 'Uses a catalog weapon referenced from the monster equipment list.',
  },
  'natural-weapon': {
    label: 'Natural weapon',
    description: 'An innate attack such as a claw or bite with authored damage.',
  },
  attack: {
    label: 'Attack',
    description: 'An authored attack with an explicit bonus source and one or both modes.',
  },
  save: {
    label: 'Saving throw',
    description: 'An area or reached effect resolved by a saving throw.',
  },
  multiattack: {
    label: 'Multiattack',
    description: 'A sequence of attacks made in the Actions section.',
  },
  'action-reference': {
    label: 'Action reference',
    description:
      'A reaction or legendary action that uses an attack or ability already listed under Actions.',
  },
  parry: {
    label: 'Parry',
    description: 'Adds a bonus to AC against the triggering melee attack.',
  },
  leap: {
    label: 'Leap',
    description: 'Jumps a distance by spending movement.',
  },
  teleport: {
    label: 'Teleport',
    description: 'Teleports to an unoccupied space it can see.',
  },
  'take-actions': {
    label: 'Take actions',
    description: 'Takes the Dash, Disengage, or Hide action.',
  },
  special: {
    label: 'Special',
    description: 'A named special action described in prose.',
  },
  spell: {
    label: getContentTypeTerm('spells').label,
    description:
      'Casts referenced spells. The structure is authoritative and the prose is generated.',
  },
} as const satisfies Record<string, GameTermEntry>

export type MonsterActionKind = keyof typeof MONSTER_ACTION_KIND_ENTRIES

export const MONSTER_ACTION_KINDS = keysFromEntries(MONSTER_ACTION_KIND_ENTRIES)

export const monsterActionKindSchema = vocabEnumFromEntries(MONSTER_ACTION_KIND_ENTRIES)

/** Returns the display label for a monster action kind. Falls back to the raw value. */
export function getMonsterActionKindLabel(id: string): string {
  return MONSTER_ACTION_KIND_ENTRIES[id as MonsterActionKind]?.label ?? id
}
