import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

/** Shares some morphemes with halfling personal pools for cross-convention linguistic reuse. */
export const halflingPlaceRootPoolCollection = {
  id: 'halfling-place-root-pool',
  label: 'Halfling settlement roots',
  description: 'Fixture place-name roots for halfling settlements.',
  subjectKinds: ['settlement', 'landmark'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'placeRoot',
        role: 'placeRoot',
        values: ['Bram', 'Green', 'Hill', 'Merry', 'Oak', 'Teal', 'Under'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
