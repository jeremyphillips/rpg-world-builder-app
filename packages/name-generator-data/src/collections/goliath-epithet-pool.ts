import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const goliathEpithetPoolCollection = {
  id: 'goliath-epithet-pool',
  label: 'Goliath epithets',
  description: 'Fixture earned-nickname pool for giant-goliath personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'epithet',
        role: 'epithet',
        genderStyle: 'shared',
        values: [
          'Bear Killer',
          'Cliff Walker',
          'Flint Finder',
          'Horncarver',
          'Keen Eye',
          'Long Leaper',
          'Skywatcher',
          'Steadyhand',
          'Stone Cutter',
          'Wildrunner',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
