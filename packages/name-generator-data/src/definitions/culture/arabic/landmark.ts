import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const arabicLandmarkDefinition = {
  key: 'landmark',
  id: 'arabic-landmark',
  label: 'Arabic landmark names',
  description: 'Landmark names built from Arabic topographic prefixes and place roots.',
  structures: [
    {
      id: 'prefix-landmark',
      label: 'Prefix and root',
      parts: [
        { key: 'placePrefix', role: 'placePrefix', required: true },
        { key: 'placeRoot', role: 'placeRoot', required: true },
      ],
      format: '{placePrefix}{placeRoot}',
    },
  ],
  partBindings: [
    {
      partKey: 'placePrefix',
      collectionId: 'arabic-landmark-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'arabic-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['arabic-landmark-prefix-pool', 'arabic-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
