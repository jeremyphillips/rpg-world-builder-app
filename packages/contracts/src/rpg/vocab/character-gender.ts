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

/** Default when legacy stored characters omit gender (pre–gender rollout). */
export const DEFAULT_CHARACTER_GENDER: CharacterGender = 'male'

export const CHARACTER_GENDERS = keysFromEntries(CHARACTER_GENDER_ENTRIES)

export const genderSchema = vocabEnumFromEntries(CHARACTER_GENDER_ENTRIES)

/** Read-path normalization for stored characters missing or invalid gender. */
export function normalizeStoredCharacterGender(input?: unknown): CharacterGender {
  const parsed = genderSchema.safeParse(input)
  return parsed.success ? parsed.data : DEFAULT_CHARACTER_GENDER
}

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
