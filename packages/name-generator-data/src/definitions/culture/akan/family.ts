import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const akanFamilyDefinition = {
  key: 'family',
  id: 'akan-family',
  label: 'Akan family names',
  description: 'Family names for akan households as a standalone subject.',
  structures: [
    {
      id: 'family-only',
      label: 'Family name',
      parts: [{ key: 'family', role: 'family', required: true }],
      format: '{family}',
    },
  ],
  partBindings: [{ partKey: 'family', collectionId: 'akan-family-pool', sourceKey: 'family' }],
  collectionIds: ['akan-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
