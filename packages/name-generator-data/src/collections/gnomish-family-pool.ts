import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const gnomishFamilyPoolCollection = {
  id: 'gnomish-family-pool',
  label: 'Gnomish family names',
  description: 'Fixture family-name pool for common-gnome personal conventions.',
  subjectKinds: ['person', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'family',
        role: 'family',
        genderStyle: 'shared',
        values: [
          'Beren',
          'Daergel',
          'Folkor',
          'Garrick',
          'Murnig',
          'Nackle',
          'Ningel',
          'Scheppen',
          'Timbers',
          'Turen',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
