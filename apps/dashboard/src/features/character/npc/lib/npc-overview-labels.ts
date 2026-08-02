import { getContentTypeItemLabel } from '@/features/content/lib/content-type-labels'

export const NPC_OVERVIEW_TABLE_KEY = 'npcs-overview' as const

export const NPC_OVERVIEW_LABELS = {
  class: getContentTypeItemLabel('classes'),
  species: getContentTypeItemLabel('species'),
  name: 'Name',
} as const

export const NPC_ROSTER_COLUMN_LABEL = 'Roster' as const
export const NPC_VITAL_COLUMN_LABEL = 'Vital' as const

/**
 * Class column shows the first `classes[]` entry's catalog name only — no subclass
 * or level suffix. Multiclass NPCs still filter by that primary class id.
 */
