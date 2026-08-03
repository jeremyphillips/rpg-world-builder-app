import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_U_Z = {
  warehouse: {
    label: 'Warehouse',
    description: 'A storage or logistics structure.',
    functions: ['storage'],
    aliases: ['storehouse'],
    searchTerms: ['storage', 'goods', 'cargo'],
    specializationTerms: ['icehouse', 'bonded warehouse'],
  },
  washhouse: {
    label: 'Washhouse',
    description: 'A building primarily serving laundry service.',
    functions: ['care', 'service'],
    searchTerms: ['laundry', 'washing', 'cleaning'],
  },
  watchtower: {
    label: 'Watchtower',
    description: 'A building primarily serving observation.',
    functions: ['defense_watch'],
    searchTerms: ['observation', 'sentry', 'lookout'],
  },
  waystation: {
    label: 'Waystation',
    description: 'A building primarily serving route rest/resupply.',
    functions: ['service'],
    searchTerms: ['rest', 'resupply', 'route'],
  },
  weigh_house: {
    label: 'Weigh House',
    description: 'A building primarily serving official weighing/verification.',
    functions: ['service'],
    searchTerms: ['weighing', 'trade', 'verification'],
  },
  wheelwright: {
    label: 'Wheelwright',
    description: 'A building primarily serving wheel making.',
    functions: ['service'],
    searchTerms: ['wheels', 'cartwright', 'woodwork'],
  },
  wizard_tower: {
    label: 'Wizard Tower',
    description: 'A building primarily serving residence.',
    functions: ['dwelling', 'knowledge'],
    searchTerms: ['magic', 'wizard', 'arcane'],
  },
  yurt: {
    label: 'Yurt',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling'],
    manifestationOf: 'house',
    searchTerms: ['felt', 'portable', 'nomadic'],
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
