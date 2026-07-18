import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const goliathGivenPoolCollection = {
  id: 'goliath-given-pool',
  label: 'Goliath given names',
  description: 'Fixture birth-name pool for giant-goliath personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given',
        role: 'given',
        genderStyle: 'shared',
        values: [
          'Aukan',
          'Eglath',
          'Gauthak',
          'Ilikan',
          'Kavaki',
          'Lo-Kag',
          'Manneo',
          'Paavu',
          'Thalai',
          'Uthal',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
