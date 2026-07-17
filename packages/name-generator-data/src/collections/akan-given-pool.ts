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
        values: ['Kwame', 'Kofi', 'Yaw', 'Kwesi', 'Kojo', 'Fiifi'],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: ['Ama', 'Akua', 'Abena', 'Efua', 'Adwoa', 'Yaa'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NameCollection
