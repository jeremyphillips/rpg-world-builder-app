import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

/** Shares some morphemes with gnomish personal pools for cross-convention linguistic reuse. */
export const gnomishPlaceRootPoolCollection = {
  id: 'gnomish-place-root-pool',
  label: 'Gnomish settlement roots',
  description: 'Fixture place-name roots for gnomish settlements.',
  subjectKinds: ['settlement', 'landmark'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'placeRoot',
        role: 'placeRoot',
        values: ['Cog', 'Glim', 'Kettle', 'Quill', 'Spark', 'Tinker', 'Whistle'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
