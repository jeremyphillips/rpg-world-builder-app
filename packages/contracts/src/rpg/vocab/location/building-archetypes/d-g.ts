import type { BuildingArchetypeShardEntry } from './types'

export const BUILDING_ARCHETYPE_ENTRIES_D_G = {
  domus: {
    label: 'Domus',
    description: 'A building primarily serving dwelling.',
    functions: ['dwelling'],
    manifestationOf: 'house',
  },
  drum_tower: {
    label: 'Drum Tower',
    description: 'A building primarily serving timekeeping/signal.',
    functions: ['defense_watch'],
    manifestationOf: 'watchtower',
  },
  embassy: {
    label: 'Embassy',
    description: 'A building primarily serving diplomatic mission.',
    functions: ['service'],
  },
  exchange: {
    label: 'Exchange',
    description: 'A building primarily serving brokered trading.',
    functions: ['finance', 'assembly'],
  },
  factory: {
    label: 'Factory',
    description: 'A building primarily serving mass manufacturing.',
    functions: ['production'],
  },
  festhall: {
    label: 'Festhall',
    description: 'A building primarily serving public feasting/revelry venue.',
    functions: ['food_drink_social'],
  },
  folly: {
    label: 'Folly',
    description: 'A building primarily serving ornament/status display only.',
    functions: ['spectacle'],
  },
  gambling_hall: {
    label: 'Gambling Hall',
    description: 'A building primarily serving gaming venue.',
    functions: ['service'],
  },
  gatehouse: {
    label: 'Gatehouse',
    description: 'A building primarily serving entry control.',
    functions: ['defense_watch'],
  },
  gladiator_school: {
    label: 'Gladiator School',
    description: 'A building primarily serving spectacle-combat training.',
    functions: ['spectacle', 'lodging'],
  },
  glassworks: {
    label: 'Glassworks',
    description: 'A building primarily serving glass production.',
    functions: ['production'],
  },
  godown: {
    label: 'Godown',
    description: 'A building primarily serving trade warehouse.',
    functions: ['storage'],
    manifestationOf: 'warehouse',
  },
  granary: {
    label: 'Granary',
    description: 'A building primarily serving grain storage.',
    functions: ['storage'],
  },
  granary_on_stilts: {
    label: 'Granary On Stilts',
    description: 'A building primarily serving raised grain store.',
    functions: ['storage'],
    manifestationOf: 'warehouse',
  },
  greenhouse: {
    label: 'Greenhouse',
    description: 'A building primarily serving protected cultivation.',
    functions: ['service'],
  },
  guard_post: {
    label: 'Guard Post',
    description: 'A building primarily serving watch/public order.',
    functions: ['defense_watch'],
  },
  guildhall: {
    label: 'Guildhall',
    description: 'The headquarters of a craft or trade guild.',
    functions: ['assembly', 'governance'],
  },
} as const satisfies Record<string, BuildingArchetypeShardEntry>
