import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const gaelicLandmarkDefinition = {
  key: 'landmark',
  id: 'gaelic-landmark',
  label: 'Gaelic landmark names',
  description: 'Landmark names built from Gaelic topographic prefixes and place roots.',
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
      collectionId: 'gaelic-landmark-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'gaelic-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['gaelic-landmark-prefix-pool', 'gaelic-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
