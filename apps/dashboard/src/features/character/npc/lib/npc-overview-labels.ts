export const NPC_OVERVIEW_TABLE_KEY = 'npcs-overview' as const

export const NPC_OVERVIEW_LABELS = {
  class: 'Class',
  species: 'Species',
  name: 'Name',
} as const

/**
 * Class column shows the first `classes[]` entry's catalog name only — no subclass
 * or level suffix. Multiclass NPCs still filter by that primary class id.
 */
