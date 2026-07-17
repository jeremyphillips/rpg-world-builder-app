import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const halflingGivenPoolCollection = {
  id: 'halfling-given-pool',
  label: 'Halfling given names',
  description: 'Fixture given-name pool for common-halfling personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: [
          'Alton',
          'Ander',
          'Cade',
          'Corrin',
          'Errich',
          'Garret',
          'Milo',
          'Osborn',
          'Roscoe',
          'Wellby',
        ],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: [
          'Andry',
          'Bree',
          'Callie',
          'Cora',
          'Euphemia',
          'Jillian',
          'Lavinia',
          'Nedda',
          'Seraphina',
          'Trym',
        ],
      },
      {
        id: 'given-neutral',
        role: 'given',
        genderStyle: 'neutral',
        values: [
          'Eldon',
          'Finnan',
          'Lindal',
          'Lyle',
          'Merric',
          'Osborn',
          'Perrin',
          'Portia',
          'Reed',
          'Roscoe',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
