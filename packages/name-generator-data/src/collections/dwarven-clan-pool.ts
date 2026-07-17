import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const dwarvenClanPoolCollection = {
  id: 'dwarven-clan-pool',
  label: 'Dwarven clan names',
  description: 'Fixture clan-name pool for mountain-dwarf personal conventions.',
  subjectKinds: ['person', 'clan', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'clan',
        role: 'clan',
        genderStyle: 'shared',
        values: [
          'Battlehammer',
          'Dankil',
          'Fireforge',
          'Frostbeard',
          'Ironfist',
          'Stonebreaker',
          'Strakeln',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
