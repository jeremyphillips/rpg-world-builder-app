import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_U_Z = {
  warehouse: {
    label: 'Warehouse',
    description: 'A storage or logistics structure.',
    functions: ['storage'],
  },
  washhouse: {
    label: 'Washhouse',
    description: 'A building primarily serving laundry service.',
    functions: ['care', 'service'],
  },
  watchtower: {
    label: 'Watchtower',
    description: 'A building primarily serving observation.',
    functions: ['defense_watch'],
  },
  waystation: {
    label: 'Waystation',
    description: 'A building primarily serving route rest/resupply.',
    functions: ['service'],
  },
  weigh_house: {
    label: 'Weigh House',
    description: 'A building primarily serving official weighing/verification.',
    functions: ['service'],
  },
  wizard_tower: {
    label: 'Wizard Tower',
    description: 'A building primarily serving residence.',
    functions: ['dwelling', 'knowledge'],
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
