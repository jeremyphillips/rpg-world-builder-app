import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const goliathClanPoolCollection = {
  id: 'goliath-clan-pool',
  label: 'Goliath clan names',
  description: 'Fixture clan-name pool for giant-goliath personal conventions.',
  subjectKinds: ['person', 'clan', 'family'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'clan',
        role: 'clan',
        genderStyle: 'shared',
        values: [
          'Anakalathai',
          'Elanithino',
          'Gathakanathi',
          'Kalagiano',
          'Katho-Ovlaga',
          'Ogolakanu',
          'Thuliaga',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
