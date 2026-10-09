import type { CatalogSortPresetDef, CatalogSortPresetId } from './catalog-sort.types'

/**
 * Named sort strategies (not axis/direction pairs).
 * Not permanently picker-only — overview relevance sorting may reuse these later.
 */
export const CATALOG_SORT_PRESETS = {
  best_match: {
    value: 'best_match',
    label: 'Best match',
    triggerLabel: 'Best match',
  },
} as const satisfies Record<CatalogSortPresetId, CatalogSortPresetDef>

export type CatalogSortPresetKey = keyof typeof CATALOG_SORT_PRESETS
