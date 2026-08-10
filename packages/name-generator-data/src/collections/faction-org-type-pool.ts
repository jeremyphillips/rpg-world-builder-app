import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const factionOrgTypePoolCollection = {
  id: 'faction-org-type-pool',
  label: 'Organization types',
  description: 'Fixture organization-type nouns for faction naming templates.',
  subjectKinds: ['faction', 'organization'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'organizationType',
        role: 'organizationType',
        values: ['Brotherhood', 'Circle', 'Company', 'Guild', 'Order', 'Syndicate'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
