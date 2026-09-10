import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const yorubaLandmarkDefinition = {
  key: 'landmark',
  id: 'yoruba-landmark',
  label: 'Yoruba landmark names',
  description: 'Landmark names built from Yoruba topographic prefixes and place roots.',
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
      collectionId: 'yoruba-landmark-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'yoruba-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['yoruba-landmark-prefix-pool', 'yoruba-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
