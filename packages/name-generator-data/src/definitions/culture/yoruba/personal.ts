import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const yorubaPersonalDefinition = {
  key: 'personal',
  id: 'yoruba-personal',
  label: 'Yoruba personal names',
  description: 'Yoruba personal naming with theophoric given names and hereditary surnames.',
  structures: [
    {
      id: 'full',
      label: 'Given and family',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'family', role: 'family', required: true },
      ],
      format: '{given} {family}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'yoruba-given-pool' },
    { partKey: 'family', collectionId: 'yoruba-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['yoruba-given-pool', 'yoruba-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
