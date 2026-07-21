import { z } from 'zod'

import { formatVocabularySlugLabel } from './format-slug-label'
import { getTermSentenceForm, type GameTermEntry, type VocabularyTerm } from './types'
import { vocabularyOptionIdSchema, type VocabularyOptionSetId } from './vocabulary'

// ---------------------------------------------------------------------------
// Senses — open vocabulary set. Range in feet stays on `senseSchema`.
// ---------------------------------------------------------------------------

export const SENSE_TERM = {
  label: 'Sense',
  description: 'A special perception such as darkvision or blindsight.',
  sentence: {
    singular: 'sense',
    plural: 'senses',
  },
} as const satisfies VocabularyTerm

export const SENSE_SET_ID = 'senses' as const satisfies VocabularyOptionSetId

/**
 * Primitive shape for stored sense type ids. Catalog membership is validated
 * against the campaign-resolved vocabulary.
 */
export const senseIdSchema = vocabularyOptionIdSchema

export type SenseId = z.infer<typeof senseIdSchema>

/**
 * Preset sense ranges (in feet) shown as a select in authoring UIs. The
 * underlying schema stays numeric — these presets are a UI affordance only.
 */
export const SENSE_RANGES = [10, 30, 60, 90, 120] as const
export type StandardSenseRange = (typeof SENSE_RANGES)[number]

/** A special sense and its range in feet (e.g. Darkvision 60 ft). */
export const senseSchema = z.object({
  type: senseIdSchema,
  range: z.number().int().min(0),
})

export type Sense = z.infer<typeof senseSchema>

/** Returns a display label — title-cased slug fallback when seed label is unknown. */
export function getSenseLabel(type: string): string {
  return formatVocabularySlugLabel(type)
}

/** Returns an entry-shaped fallback for an open-vocabulary sense id. */
export function getSenseEntry(type: string): GameTermEntry {
  const label = getSenseLabel(type)
  return {
    label,
    description: '',
    sentence: {
      singular: label,
      plural: label,
    },
  }
}

/** Counted noun phrase for generated sense prose. */
export function getSenseSentenceForm(type: string, count = 1): string {
  return getTermSentenceForm(getSenseEntry(type), count)
}
