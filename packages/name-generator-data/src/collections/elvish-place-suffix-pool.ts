import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const elvishPlaceSuffixPoolCollection = {
  id: 'elvish-place-suffix-pool',
  label: 'Elvish settlement suffixes',
  description: 'Fixture place-name suffixes for elvish settlements.',
  subjectKinds: ['settlement', 'landmark'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'placeSuffix',
        role: 'placeSuffix',
        values: ['anthor', 'dril', 'lome', 'ras', 'thal', 'vandor', 'wyn'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
