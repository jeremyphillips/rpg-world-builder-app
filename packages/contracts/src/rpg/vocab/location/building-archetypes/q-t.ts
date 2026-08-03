import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_Q_T = {
  records_hall: {
    label: 'Records Hall',
    description: 'A building primarily serving records custody (state).',
    functions: ['governance', 'knowledge'],
  },
  ribat: {
    label: 'Ribat',
    description: 'A building primarily serving frontier defense.',
    functions: ['defense_watch', 'worship'],
    manifestationOf: 'monastery',
  },
  roundhouse: {
    label: 'Roundhouse',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling'],
    manifestationOf: 'house',
  },
  ryokan: {
    label: 'Ryokan',
    description: 'A building primarily serving traveler inn (ritualized).',
    functions: ['lodging', 'care'],
    manifestationOf: 'inn',
  },
  salt_works: {
    label: 'Salt Works',
    description: 'A building primarily serving salt extraction/evaporation.',
    functions: ['production'],
  },
  shipyard: {
    label: 'Shipyard',
    description: 'A building primarily serving ship construction.',
    functions: ['production', 'transport_support'],
  },
  shop: {
    label: 'Shop',
    description: 'A building primarily serving retail (general).',
    functions: ['retail'],
  },
  siheyuan: {
    label: 'Siheyuan',
    description: 'A building primarily serving dwelling (multi-generation).',
    functions: ['dwelling'],
    manifestationOf: 'house',
  },
  slaughterhouse: {
    label: 'Slaughterhouse',
    description: 'A building primarily serving animal processing.',
    functions: ['production'],
  },
  stable: {
    label: 'Stable',
    description: 'A building for housing and caring for mounts.',
    functions: ['service'],
    searchTerms: ['horses'],
  },
  stave_church: {
    label: 'Stave Church',
    description: 'A building primarily serving worship.',
    functions: ['worship'],
    manifestationOf: 'temple',
  },
  sweat_lodge: {
    label: 'Sweat Lodge',
    description: 'A building primarily serving ceremonial heat rite.',
    functions: ['worship'],
    manifestationOf: 'bathhouse',
  },
  synagogue: {
    label: 'Synagogue',
    description: 'A building primarily serving worship.',
    functions: ['worship', 'knowledge'],
    manifestationOf: 'temple',
  },
  tannery: {
    label: 'Tannery',
    description: 'A building primarily serving hide processing.',
    functions: ['production'],
  },
  tavern: {
    label: 'Tavern',
    description: 'A venue for food, drink, and social gathering.',
    functions: ['food_drink_social'],
  },
  teahouse: {
    label: 'Teahouse',
    description: 'A building primarily serving tea service.',
    functions: ['food_drink_social'],
    manifestationOf: 'tavern',
  },
  temple: {
    label: 'Temple',
    description: 'A religious or ceremonial structure.',
    functions: ['worship'],
  },
  tenement: {
    label: 'Tenement',
    description: 'A building primarily serving dwelling (multi-household).',
    functions: ['dwelling'],
  },
  theater: {
    label: 'Theater',
    description: 'A building primarily serving staged performance.',
    functions: ['spectacle'],
  },
  tholos: {
    label: 'Tholos',
    description: 'A building primarily serving vaulted tomb chamber.',
    functions: ['funerary'],
    manifestationOf: 'mausoleum',
  },
  tolbooth: {
    label: 'Tolbooth',
    description: 'A building primarily serving administration.',
    functions: ['governance'],
    manifestationOf: 'courthouse',
  },
  tower: {
    label: 'Tower',
    description: 'A building primarily serving (varies by occupant).',
    functions: ['service'],
  },
  town_hall: {
    label: 'Town Hall',
    description: 'A building primarily serving civic administration.',
    functions: ['governance', 'assembly'],
  },
  trading_factory: {
    label: 'Trading Factory',
    description: 'A building primarily serving merchant station (office.',
    functions: ['retail', 'dwelling'],
    manifestationOf: 'warehouse',
  },
  trading_post: {
    label: 'Trading Post',
    description: 'A building primarily serving exchange.',
    functions: ['retail', 'lodging'],
  },
  training_hall: {
    label: 'Training Hall',
    description: 'A building primarily serving martial drill.',
    functions: ['service'],
  },
  treasury: {
    label: 'Treasury',
    description: 'A building primarily serving wealth custody (state).',
    functions: ['governance'],
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
