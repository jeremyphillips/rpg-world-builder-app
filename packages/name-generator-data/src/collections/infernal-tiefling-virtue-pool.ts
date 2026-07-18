import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const infernalTieflingVirtuePoolCollection = {
  id: 'infernal-tiefling-virtue-pool',
  label: 'Infernal tiefling virtue names',
  description: 'Fixture virtue-name pool for optional infernal-tiefling surnames.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'virtue',
        role: 'virtue',
        genderStyle: 'shared',
        values: [
          'Art',
          'Creed',
          'Destiny',
          'Glory',
          'Hope',
          'Music',
          'Mystery',
          'Reverence',
          'Sorrow',
          'Weary',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
