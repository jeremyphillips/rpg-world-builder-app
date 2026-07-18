import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const elvishGivenPoolCollection = {
  id: 'elvish-given-pool',
  label: 'Elvish given names',
  description: 'Fixture given-name pool for elven personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: [
          'Aelar',
          'Adran',
          'Aramil',
          'Berrian',
          'Carric',
          'Erevan',
          'Galinndan',
          'Heian',
          'Lucan',
          'Peren',
        ],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: [
          'Adrie',
          'Althaea',
          'Bethrynna',
          'Enna',
          'Ilyrana',
          'Lia',
          'Meriele',
          'Naivara',
          'Quelenna',
          'Sariel',
        ],
      },
      {
        id: 'given-neutral',
        role: 'given',
        genderStyle: 'neutral',
        values: [
          'Aerendyl',
          'Hadarai',
          'Ivellios',
          'Laucian',
          'Lhoris',
          'Rael',
          'Rolen',
          'Sylvar',
          'Theren',
          'Varis',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
