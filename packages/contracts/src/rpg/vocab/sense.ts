import { z } from 'zod'

import { standardFeet } from '../primitives/distance-presets'
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
 * Preset sense ranges (in feet) for grant and creature authoring. Ten-foot
 * steps through 120. The stored range stays a number — these presets are the
 * legal authoring choices.
 */
export const SENSE_RANGES = standardFeet(10, 120, 10) as unknown as readonly [
  10,
  20,
  30,
  40,
  50,
  60,
  70,
  80,
  90,
  100,
  110,
  120,
]
export type StandardSenseRange = (typeof SENSE_RANGES)[number]

export const STANDARD_SENSE_RANGE_MESSAGE = 'Choose a sense range in feet.'

/** Authoring preset check — stored range may be any non-negative integer. */
export function isStandardSenseRange(range: number): range is StandardSenseRange {
  return (SENSE_RANGES as readonly number[]).includes(range)
}

/** Shared copy for preset range refinements (monster publish, sense templates). */
export function standardSenseRangeValidationMessage(): string {
  return STANDARD_SENSE_RANGE_MESSAGE
}

/** Trait and facing rules sentence for a resolved sense fact. */
export function formatCreatureSenseTraitRulesSentence(sense: Sense): string {
  return `You have ${getSenseSentenceForm(sense.type)} with a range of ${sense.range} feet.`
}

/** Compact stat line for one sense (e.g. `Darkvision 60 ft.`). */
export function formatCreatureSenseCompactLine(
  sense: Sense,
  label = getSenseLabel(sense.type),
): string {
  return `${label} ${sense.range} ft.`
}

/** Joins compact sense lines for species and monster stat rows. */
export function formatCreatureSensesCompactList(
  senses: readonly Sense[],
  separator = ', ',
): string {
  if (senses.length === 0) return ''
  return senses.map((sense) => formatCreatureSenseCompactLine(sense)).join(separator)
}

/** A special sense and its range in feet (e.g. Darkvision 60 ft). */
export const senseSchema = z.object({
  type: senseIdSchema,
  range: z.number().int().min(0),
})

export type Sense = z.infer<typeof senseSchema>

/** Authoring draft — range may be unset until the author picks a distance. */
export const senseDraftSchema = z.object({
  type: senseIdSchema,
  range: z.number().int().min(0).optional(),
})

export type SenseDraft = z.infer<typeof senseDraftSchema>

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
