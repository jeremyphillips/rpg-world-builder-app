import { CATALOG_LAYER_ENTRIES, type CatalogLayer } from '@rpg/contracts'
import type { SourceBadgeMap } from '@/lib/data-table/column-builders'

export type { CatalogLayer }

export const CATALOG_LAYER_BADGE = {
  system: {
    appearance: 'soft',
    tone: 'neutral',
    label: CATALOG_LAYER_ENTRIES.system.label,
  },
  homebrew: {
    appearance: 'outline',
    tone: 'neutral',
    label: CATALOG_LAYER_ENTRIES.homebrew.label,
  },
} as const satisfies SourceBadgeMap<CatalogLayer>
