import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const gnomePersonalDefinition = {
  key: 'personal',
  id: 'gnomish-personal',
  label: 'Common Gnomish personal names',
  description: 'Given and family names for gnome characters.',
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
    { partKey: 'given', collectionId: 'gnomish-given-pool' },
    { partKey: 'family', collectionId: 'gnomish-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['gnomish-given-pool', 'gnomish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
