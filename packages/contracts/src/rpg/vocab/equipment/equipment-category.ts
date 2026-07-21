import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Equipment categories — taxonomy for grouping equipment catalog items.
// ---------------------------------------------------------------------------

export const EQUIPMENT_CATEGORY_TERM = {
  label: 'Equipment Category',
  description: 'A grouping used to organize equipment catalog items.',
  sentence: {
    singular: 'equipment category',
    plural: 'equipment categories',
  },
} as const satisfies VocabularyTerm
