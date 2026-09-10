import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const halflingFamilyDefinition = {
  key: 'family',
  id: 'halfling-family',
  label: 'Common Halfling family names',
  description: 'Family names for halfling households as a standalone subject.',
  structures: [
    {
      id: 'family-only',
      label: 'Family name',
      parts: [{ key: 'family', role: 'family', required: true }],
      format: '{family}',
    },
  ],
  partBindings: [{ partKey: 'family', collectionId: 'halfling-family-pool', sourceKey: 'family' }],
  collectionIds: ['halfling-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
