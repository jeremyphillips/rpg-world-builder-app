import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicDragonGivenPoolCollection = {
  id: 'draconic-dragon-given-pool',
  label: 'True dragon given names',
  description: 'Fixture given-name pool for true dragon personal conventions.',
  subjectKinds: ['person', 'creature'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given',
        role: 'given',
        genderStyle: 'not-applicable',
        values: [
          'Aurixthar',
          'Caesimyr',
          'Drakomire',
          'Glaurungar',
          'Nithramor',
          'Saryndrax',
          'Thraxion',
          'Vermithorax',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
