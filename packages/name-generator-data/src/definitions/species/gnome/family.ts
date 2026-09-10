import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const gnomeFamilyDefinition = {
  key: 'family',
  id: 'gnomish-family',
  label: 'Common Gnomish family names',
  description: 'Family names for gnomish households as a standalone subject.',
  structures: [
    {
      id: 'family-only',
      label: 'Family name',
      parts: [{ key: 'family', role: 'family', required: true }],
      format: '{family}',
    },
  ],
  partBindings: [{ partKey: 'family', collectionId: 'gnomish-family-pool', sourceKey: 'family' }],
  collectionIds: ['gnomish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
