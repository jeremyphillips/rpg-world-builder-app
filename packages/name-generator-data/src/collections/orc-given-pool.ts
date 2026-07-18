import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const orcGivenPoolCollection = {
  id: 'orc-given-pool',
  label: 'Orc given names',
  description: 'Fixture given-name pool for common-orc personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: [
          'Dench',
          'Feng',
          'Holg',
          'Imsh',
          'Krusk',
          'Mhurren',
          'Ront',
          'Shump',
          'Thokk',
          'Gell',
        ],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: [
          'Baggi',
          'Emen',
          'Myev',
          'Neega',
          'Ovak',
          'Ownka',
          'Shautha',
          'Volen',
          'Vola',
          'Yevelda',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
