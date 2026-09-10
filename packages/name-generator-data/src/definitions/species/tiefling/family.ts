import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const tieflingFamilyDefinition = {
  key: 'family',
  id: 'infernal-tiefling-family',
  label: 'Infernal Tiefling family names',
  description: 'Virtue names used as family and legacy names for tiefling households.',
  structures: [
    {
      id: 'family-only',
      label: 'Virtue family name',
      parts: [{ key: 'virtue', role: 'virtue', required: true }],
      format: '{virtue}',
    },
  ],
  partBindings: [
    { partKey: 'virtue', collectionId: 'infernal-tiefling-virtue-pool', sourceKey: 'virtue' },
  ],
  collectionIds: ['infernal-tiefling-virtue-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
