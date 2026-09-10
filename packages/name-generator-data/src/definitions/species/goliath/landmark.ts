import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const goliathLandmarkDefinition = {
  key: 'landmark',
  id: 'goliath-landmark',
  label: 'Giant Goliath landmark names',
  description: 'Landmark names built from goliath place roots and landmark suffixes.',
  structures: [
    {
      id: 'compound-landmark',
      label: 'Root and landmark suffix',
      parts: [
        { key: 'placeRoot', role: 'placeRoot', required: true },
        { key: 'placeSuffix', role: 'placeSuffix', required: true },
      ],
      format: '{placeRoot}{placeSuffix}',
    },
  ],
  partBindings: [
    { partKey: 'placeRoot', collectionId: 'goliath-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'goliath-landmark-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['goliath-place-root-pool', 'goliath-landmark-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
