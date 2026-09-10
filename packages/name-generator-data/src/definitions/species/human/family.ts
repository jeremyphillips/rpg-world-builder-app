import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const humanFamilyDefinition = {
  key: 'family',
  id: 'human-family',
  label: 'Common Human family names',
  description: 'Family names for human households as a standalone subject.',
  structures: [
    {
      id: 'family-only',
      label: 'Family name',
      parts: [{ key: 'family', role: 'family', required: true }],
      format: '{family}',
    },
  ],
  partBindings: [{ partKey: 'family', collectionId: 'human-family-pool', sourceKey: 'family' }],
  collectionIds: ['human-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
