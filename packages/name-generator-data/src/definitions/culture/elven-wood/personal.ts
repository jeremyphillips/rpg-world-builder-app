import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const elvenWoodPersonalDefinition = {
  key: 'personal',
  id: 'elvish-wood-personal',
  label: 'Wood Elven personal names',
  description: 'Given and family names for wood-elf characters.',
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
    { partKey: 'given', collectionId: 'elvish-wood-given-pool' },
    { partKey: 'family', collectionId: 'elvish-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['elvish-wood-given-pool', 'elvish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
