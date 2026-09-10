import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const halflingLandmarkDefinition = {
  key: 'landmark',
  id: 'halfling-landmark',
  label: 'Common Halfling landmark names',
  description: 'Landmark names built from halfling place roots and landmark suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'halfling-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'halfling-landmark-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['halfling-place-root-pool', 'halfling-landmark-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
