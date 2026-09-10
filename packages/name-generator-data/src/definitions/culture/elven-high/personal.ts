import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const elvenHighPersonalDefinition = {
  key: 'personal',
  id: 'elvish-high-personal',
  label: 'High Elven personal names',
  description: 'Given and family names for high-elf characters.',
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
    { partKey: 'given', collectionId: 'elvish-high-given-pool' },
    { partKey: 'family', collectionId: 'elvish-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['elvish-high-given-pool', 'elvish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
