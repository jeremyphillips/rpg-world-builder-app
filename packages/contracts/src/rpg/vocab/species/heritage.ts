import type { VocabularyTerm } from '../types'
import { getTermSentenceForm, vocabularyTermLabel } from '../types'

// ---------------------------------------------------------------------------
// Species heritage — player-facing lineage / ancestry choice on a species.
// ---------------------------------------------------------------------------

export const SPECIES_HERITAGE_TERM = {
  label: 'Heritage',
  description: 'Lineage or ancestry options offered by a playable species.',
  sentence: {
    singular: 'heritage',
    plural: 'heritage',
  },
} as const satisfies VocabularyTerm

export function getSpeciesHeritageLabel(): string {
  return SPECIES_HERITAGE_TERM.label
}

export function getSpeciesHeritageSentenceForm(count = 1): string {
  return getTermSentenceForm(SPECIES_HERITAGE_TERM, count)
}

/** Title-case heritage options group label (e.g. tab resolver field). */
export function getSpeciesHeritageOptionsLabel(): string {
  return `${getSpeciesHeritageLabel()} options`
}

/** Dependent-choice affordance — e.g. "Change heritage". */
export function formatChangeSpeciesHeritageLabel(): string {
  return `Change ${getSpeciesHeritageSentenceForm(1)}`
}

/** Capitalized kind word for status copy — e.g. "Heritage required". */
export function getSpeciesHeritageKindLabel(): string {
  return vocabularyTermLabel(SPECIES_HERITAGE_TERM, {
    number: 'singular',
    casing: 'title',
  })
}
