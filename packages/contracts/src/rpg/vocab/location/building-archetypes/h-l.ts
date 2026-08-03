import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_H_L = {
  hammam: {
    label: 'Hammam',
    description: 'A building primarily serving steam bathing ritual.',
    functions: ['care'],
    manifestationOf: 'bathhouse',
  },
  healers_house: {
    label: 'Healers House',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling'],
  },
  hermitage: {
    label: 'Hermitage',
    description: 'A building primarily serving solitary devotion dwelling.',
    functions: ['dwelling', 'worship'],
  },
  hof: {
    label: 'Hof',
    description: 'A building primarily serving worship.',
    functions: ['food_drink_social', 'worship'],
    manifestationOf: 'temple',
  },
  hospice: {
    label: 'Hospice',
    description: 'A building primarily serving terminal/traveler care.',
    functions: ['lodging', 'care'],
  },
  hospital: {
    label: 'Hospital',
    description: 'A building primarily serving inpatient care.',
    functions: ['care'],
  },
  house: {
    label: 'House',
    description: 'A private dwelling.',
    functions: ['dwelling'],
  },
  hunting_lodge: {
    label: 'Hunting Lodge',
    description: 'A building primarily serving dwelling (seasonal leisure).',
    functions: ['dwelling'],
  },
  inn: {
    label: 'Inn',
    description: 'A lodging house that also serves food and drink.',
    functions: ['lodging', 'food_drink_social'],
    searchTerms: ['traveler'],
  },
  insula: {
    label: 'Insula',
    description: 'A building primarily serving dwelling (multi).',
    functions: ['dwelling', 'retail'],
    manifestationOf: 'apartment_building',
  },
  keep: {
    label: 'Keep',
    description: 'A building primarily serving last-refuge stronghold.',
    functions: ['dwelling'],
  },
  kiva: {
    label: 'Kiva',
    description: 'A building primarily serving worship (rite).',
    functions: ['worship'],
  },
  lazaretto: {
    label: 'Lazaretto',
    description: 'A building primarily serving quarantine isolation.',
    functions: ['care'],
  },
  library: {
    label: 'Library',
    description: 'A building for study and curated records.',
    functions: ['knowledge'],
    searchTerms: ['books'],
  },
  lighthouse: {
    label: 'Lighthouse',
    description: 'A building primarily serving navigation signal.',
    functions: ['defense_watch', 'dwelling'],
  },
  longhouse: {
    label: 'Longhouse',
    description: 'A building primarily serving communal dwelling.',
    functions: ['dwelling', 'assembly'],
    manifestationOf: 'house',
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
