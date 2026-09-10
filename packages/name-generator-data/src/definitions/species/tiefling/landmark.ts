import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const tieflingLandmarkDefinition = {
  key: 'landmark',
  id: 'infernal-tiefling-landmark',
  label: 'Infernal Tiefling landmark names',
  description: 'Landmark names built from infernal tiefling place roots and landmark suffixes.',
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
    {
      partKey: 'placeRoot',
      collectionId: 'infernal-tiefling-place-root-pool',
      sourceKey: 'placeRoot',
    },
    {
      partKey: 'placeSuffix',
      collectionId: 'infernal-tiefling-landmark-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['infernal-tiefling-place-root-pool', 'infernal-tiefling-landmark-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
