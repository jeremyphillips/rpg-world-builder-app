import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

/** Shares some morphemes with elvish personal pools for cross-convention linguistic reuse. */
export const elvishPlaceRootPoolCollection = {
  id: 'elvish-place-root-pool',
  label: 'Elvish settlement roots',
  description: 'Fixture place-name roots for elvish settlements.',
  subjectKinds: ['settlement', 'landmark'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'placeRoot',
        role: 'placeRoot',
        values: ['Ael', 'Cele', 'Mith', 'Sil', 'Ther', 'Lyr', 'Nim'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
