import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dragonbornLandmarkDefinition = {
  key: 'landmark',
  id: 'draconic-dragonborn-landmark',
  label: 'Draconic dragonborn landmark names',
  description: 'Landmark names built from draconic dragonborn place roots and landmark suffixes.',
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
      collectionId: 'draconic-dragonborn-place-root-pool',
      sourceKey: 'placeRoot',
    },
    {
      partKey: 'placeSuffix',
      collectionId: 'draconic-dragonborn-landmark-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: [
    'draconic-dragonborn-place-root-pool',
    'draconic-dragonborn-landmark-suffix-pool',
  ],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
