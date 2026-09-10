import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const hanChineseFamilyDefinition = {
  key: 'family',
  id: 'han-chinese-family',
  label: 'Han Chinese family names',
  description: 'Family names for Han Chinese households as a standalone subject.',
  structures: [
    {
      id: 'family-only',
      label: 'Family name',
      parts: [{ key: 'family', role: 'family', required: true }],
      format: '{family}',
    },
  ],
  partBindings: [
    { partKey: 'family', collectionId: 'han-chinese-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['han-chinese-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
