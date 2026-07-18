import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const halflingPlaceSuffixPoolCollection = {
  id: 'halfling-place-suffix-pool',
  label: 'Halfling settlement suffixes',
  description: 'Fixture place-name suffixes for halfling settlements.',
  subjectKinds: ['settlement', 'landmark'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'placeSuffix',
        role: 'placeSuffix',
        values: ['barrow', 'bottom', 'dale', 'field', 'hollow', 'mead', 'wick'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
