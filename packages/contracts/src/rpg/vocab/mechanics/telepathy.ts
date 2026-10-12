import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Telepathy — creature communication mechanic (characters may adopt later).
// ---------------------------------------------------------------------------

export const TELEPATHY_TERM = {
  label: 'Telepathy',
  description:
    'Mental communication with other creatures, usually limited by range in feet or miles.',
  sentence: {
    singular: 'telepathy',
    plural: 'telepathy',
  },
} as const satisfies VocabularyTerm
