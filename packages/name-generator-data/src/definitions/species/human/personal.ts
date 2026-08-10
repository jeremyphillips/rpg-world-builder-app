import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const humanPersonalDefinition = {
  key: 'personal',
  id: 'human-personal',
  label: 'Common Human personal names',
  description: 'Given and family names for human characters.',
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
    { partKey: 'given', collectionId: 'human-given-pool' },
    { partKey: 'family', collectionId: 'human-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['human-given-pool', 'human-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
