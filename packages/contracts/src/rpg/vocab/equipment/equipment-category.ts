import type { VocabularyOptionSetId } from '../vocabulary'
import type { VocabularyTerm } from '../types'

import { EQUIPMENT_KIND_ENTRIES, type EquipmentKind } from './kind'

// ---------------------------------------------------------------------------
// Equipment categories — taxonomy for grouping equipment catalog items.
// Seed rows mirror equipment kinds until category-specific rows are needed.
// ---------------------------------------------------------------------------

export const EQUIPMENT_CATEGORY_TERM = {
  label: 'Equipment Category',
  description: 'A grouping used to organize equipment catalog items.',
  sentence: {
    singular: 'equipment category',
    plural: 'equipment categories',
  },
} as const satisfies VocabularyTerm

export const EQUIPMENT_CATEGORY_SET_ID =
  'equipment-categories' as const satisfies VocabularyOptionSetId

/** Catalog seed rows for the equipment-categories vocabulary set. */
export const EQUIPMENT_CATEGORY_ENTRIES = EQUIPMENT_KIND_ENTRIES

export type EquipmentCategory = EquipmentKind
