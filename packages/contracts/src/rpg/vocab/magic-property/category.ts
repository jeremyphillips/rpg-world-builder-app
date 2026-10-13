import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'

import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Magic property categories — catalog preset classification for equipment.
// ---------------------------------------------------------------------------

export const MAGIC_PROPERTY_CATEGORY_TERM = {
  label: 'Magic Property Category',
  description: 'Whether a magic property is a standard enhancement or special rules text.',
  sentence: {
    singular: 'magic property category',
    plural: 'magic property categories',
  },
} as const satisfies VocabularyTerm

export const MAGIC_PROPERTY_CATEGORY_ENTRIES = {
  enhancement: {
    label: 'Enhancement',
    description: 'A standard numeric enhancement such as a +1 weapon.',
    sentence: {
      singular: 'enhancement',
      plural: 'enhancements',
    },
  },
  special: {
    label: 'Special',
    description: 'Named magical properties without structured numeric effects.',
    sentence: {
      singular: 'special property',
      plural: 'special properties',
    },
  },
} as const satisfies Record<string, GameTermEntry>

export type MagicPropertyCategory = keyof typeof MAGIC_PROPERTY_CATEGORY_ENTRIES

export const MAGIC_PROPERTY_CATEGORIES = keysFromEntries(MAGIC_PROPERTY_CATEGORY_ENTRIES)

export const magicPropertyCategorySchema = vocabEnumFromEntries(MAGIC_PROPERTY_CATEGORY_ENTRIES)
