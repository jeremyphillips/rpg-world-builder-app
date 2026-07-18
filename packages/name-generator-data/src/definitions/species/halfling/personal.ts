import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const halflingPersonalDefinition = {
  key: 'personal',
  id: 'halfling-personal',
  label: 'Common Halfling personal names',
  description: 'Given and family names for halfling characters.',
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
    { partKey: 'given', collectionId: 'halfling-given-pool' },
    { partKey: 'family', collectionId: 'halfling-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['halfling-given-pool', 'halfling-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
