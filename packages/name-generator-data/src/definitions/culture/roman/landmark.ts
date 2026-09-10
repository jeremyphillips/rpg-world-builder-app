import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const romanLandmarkDefinition = {
  key: 'landmark',
  id: 'roman-landmark',
  label: 'Roman landmark names',
  description: 'Landmark names built from Latin topographic prefixes and place roots.',
  structures: [
    {
      id: 'prefix-landmark',
      label: 'Prefix and root',
      parts: [
        { key: 'placePrefix', role: 'placePrefix', required: true },
        { key: 'placeRoot', role: 'placeRoot', required: true },
      ],
      format: '{placePrefix} {placeRoot}',
    },
  ],
  partBindings: [
    {
      partKey: 'placePrefix',
      collectionId: 'roman-landmark-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'roman-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['roman-landmark-prefix-pool', 'roman-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
