import { z } from 'zod'

import { keysFromEntries, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

// ---------------------------------------------------------------------------
// Character gender — closed identity vocabulary for stored characters.
// Distinct from name-generator genderStyle (masculine / feminine).
// ---------------------------------------------------------------------------

export const CHARACTER_GENDER_TERM = {
  label: 'Gender',
  description: "A character's gender identity for sheet display and authoring.",
  sentence: {
    singular: 'gender',
    plural: 'genders',
  },
} as const satisfies VocabularyTerm

export const CHARACTER_GENDER_ENTRIES = {
  male: {
    label: 'Male',
    description: 'The character identifies as male.',
  },
  female: {
    label: 'Female',
    description: 'The character identifies as female.',
  },
} as const satisfies Record<string, GameTermEntry>

export type CharacterGender = keyof typeof CHARACTER_GENDER_ENTRIES

export const CHARACTER_GENDERS = keysFromEntries(CHARACTER_GENDER_ENTRIES)

export const genderSchema = vocabEnumFromEntries(CHARACTER_GENDER_ENTRIES)

/** Coerces blank select sentinels before enum validation (forms, persisted drafts). */
export const optionalGenderSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.length === 0 ? undefined : value),
  genderSchema.optional(),
)

/** Returns the reference entry for a gender id, if known. */
export function getGenderEntry(id: string): GameTermEntry | undefined {
  return CHARACTER_GENDER_ENTRIES[id as CharacterGender]
}

/** Returns the display label for a gender id. Falls back to the raw value. */
export function getGenderLabel(id: string): string {
  return getGenderEntry(id)?.label ?? id
}

export const CHARACTER_GENDER_OPTIONS = termOptionsFromEntries(CHARACTER_GENDER_ENTRIES)
