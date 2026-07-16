import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const elvishFamilyPoolCollection = {
  id: 'elvish-family-pool',
  label: 'Elvish family names',
  description: 'Fixture family-name pool for high-elven personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'family',
        role: 'family',
        genderStyle: 'shared',
        values: [
          'Amastacia',
          'Galanodel',
          'Holimion',
          'Ilphelkiir',
          'Nairolo',
          'Siannodel',
          'Xiloscient',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
