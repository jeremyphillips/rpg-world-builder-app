import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicPersonalPoolCollection = {
  id: 'draconic-personal-pool',
  label: 'Draconic personal names',
  description: 'Fixture personal names for true dragons.',
  subjectKinds: ['person', 'creature'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given',
        role: 'given',
        genderStyle: 'not-applicable',
        values: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Kriv', 'Medrash', 'Torinn'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
