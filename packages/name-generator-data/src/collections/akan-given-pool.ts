import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const akanGivenPoolCollection = {
  id: 'akan-given-pool',
  label: 'Akan given names',
  description: 'Fixture given-name pool for akan personal naming.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: ['Fiifi', 'Kofi', 'Kojo', 'Kwame', 'Kwesi', 'Yaw'],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: ['Abena', 'Adwoa', 'Akua', 'Ama', 'Efua', 'Yaa'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NameCollection
