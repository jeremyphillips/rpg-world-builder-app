import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const akanFamilyPoolCollection = {
  id: 'akan-family-pool',
  label: 'Akan family names',
  description: 'Fixture family-name pool for akan personal naming.',
  subjectKinds: ['person', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'family',
        role: 'family',
        genderStyle: 'shared',
        values: ['Agyeman', 'Asante', 'Boateng', 'Darko', 'Mensah', 'Owusu'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NameCollection
