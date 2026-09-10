import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const arabicFamilyDefinition = {
  key: 'family',
  id: 'arabic-family',
  label: 'Arabic family names',
  description: 'Nisba epithets for Arabic households as a standalone subject.',
  structures: [
    {
      id: 'nisba-only',
      label: 'Nisba',
      parts: [{ key: 'nisba', role: 'epithet', required: true }],
      format: '{nisba}',
    },
  ],
  partBindings: [{ partKey: 'nisba', collectionId: 'arabic-nisba-pool', sourceKey: 'epithet' }],
  collectionIds: ['arabic-nisba-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
