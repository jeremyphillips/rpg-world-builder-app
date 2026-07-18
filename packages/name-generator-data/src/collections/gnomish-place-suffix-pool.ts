import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const gnomishPlaceSuffixPoolCollection = {
  id: 'gnomish-place-suffix-pool',
  label: 'Gnomish settlement suffixes',
  description: 'Fixture place-name suffixes for gnomish settlements.',
  subjectKinds: ['settlement', 'landmark'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'placeSuffix',
        role: 'placeSuffix',
        values: ['bottom', 'cog', 'ford', 'ton', 'vale', 'wick', 'works'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
