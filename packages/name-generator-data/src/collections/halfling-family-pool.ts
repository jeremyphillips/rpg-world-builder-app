import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const halflingFamilyPoolCollection = {
  id: 'halfling-family-pool',
  label: 'Halfling family names',
  description: 'Fixture family-name pool for common-halfling personal conventions.',
  subjectKinds: ['person', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'family',
        role: 'family',
        genderStyle: 'shared',
        values: [
          'Brushgather',
          'Goodbarrel',
          'Greenbottle',
          'Hilltopple',
          'Tealeaf',
          'Thorngage',
          'Underbough',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
