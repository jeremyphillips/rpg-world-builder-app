import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicClanPoolCollection = {
  id: 'draconic-clan-pool',
  label: 'Draconic clan names',
  description: 'Fixture clan names influenced by draconic naming patterns.',
  subjectKinds: ['clan', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'clan',
        role: 'clan',
        genderStyle: 'shared',
        values: ['Ashwing', 'Cinderclaw', 'Ironscale', 'Stormbreath', 'Sunfury', 'Voidmaw'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
