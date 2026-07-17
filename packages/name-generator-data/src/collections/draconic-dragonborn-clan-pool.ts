import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicDragonbornClanPoolCollection = {
  id: 'draconic-dragonborn-clan-pool',
  label: 'Dragonborn clan names',
  description: 'Fixture clan-name pool for dragonborn personal and clan conventions.',
  subjectKinds: ['person', 'clan', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'clan',
        role: 'clan',
        genderStyle: 'shared',
        values: [
          'Ashwing',
          'Cinderclaw',
          'Ironscale',
          'Stormbreath',
          'Sunfury',
          'Voidmaw',
          'Wyrmheart',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
