import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const elvenFamilyDefinition = {
  key: 'family',
  id: 'elvish-family',
  label: 'Elven family names',
  description: 'Family names for elvish households as a standalone subject.',
  structures: [
    {
      id: 'family-only',
      label: 'Family name',
      parts: [{ key: 'family', role: 'family', required: true }],
      format: '{family}',
    },
  ],
  partBindings: [{ partKey: 'family', collectionId: 'elvish-family-pool', sourceKey: 'family' }],
  collectionIds: ['elvish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
