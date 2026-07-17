import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicDragonbornGivenPoolCollection = {
  id: 'draconic-dragonborn-given-pool',
  label: 'Dragonborn given names',
  description: 'Fixture given-name pool for dragonborn personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given',
        role: 'given',
        genderStyle: 'shared',
        values: [
          'Arjhan',
          'Balasar',
          'Bharash',
          'Donaar',
          'Ghesh',
          'Heskan',
          'Kriv',
          'Medrash',
          'Mehen',
          'Torinn',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
