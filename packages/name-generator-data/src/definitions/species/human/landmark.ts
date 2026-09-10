import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const humanLandmarkDefinition = {
  key: 'landmark',
  id: 'human-landmark',
  label: 'Common Human landmark names',
  description: 'Landmark names built from human place roots and landmark suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'human-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'human-landmark-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['human-place-root-pool', 'human-landmark-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
