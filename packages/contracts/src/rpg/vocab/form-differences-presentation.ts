import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import type { GameTermEntry, VocabularyTerm } from './types'

export const FORM_DIFFERENCES_PRESENTATION_TERM = {
  label: 'Form differences presentation',
  description: 'Where size, movement, and speech differences appear on the stat block.',
  sentence: {
    singular: 'form differences presentation',
    plural: 'form differences presentations',
  },
} as const satisfies VocabularyTerm

export const FORM_DIFFERENCES_PRESENTATION_ENTRIES = {
  'stat-rows': {
    label: 'Speed and Languages rows',
    description: 'Show movement and speech qualifiers on the Speed and Languages stat rows.',
  },
  'transformation-description': {
    label: 'Shape-Shift description',
    description:
      'Show movement parentheticals and speech sentences in the Shape-Shift action description.',
  },
} as const satisfies Record<string, GameTermEntry>

export type FormDifferencesPresentation = keyof typeof FORM_DIFFERENCES_PRESENTATION_ENTRIES

export const FORM_DIFFERENCES_PRESENTATION = keysFromEntries(FORM_DIFFERENCES_PRESENTATION_ENTRIES)

export const formDifferencesPresentationSchema = vocabEnumFromEntries(
  FORM_DIFFERENCES_PRESENTATION_ENTRIES,
)
