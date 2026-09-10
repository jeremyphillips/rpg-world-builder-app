import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dragonbornSettlementDefinition = {
  key: 'settlement',
  id: 'draconic-dragonborn-settlement',
  label: 'Draconic dragonborn settlement names',
  description:
    'Settlement names built from draconic dragonborn place roots and settlement suffixes.',
  structures: [
    {
      id: 'compound-place',
      label: 'Root and suffix',
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
      collectionId: 'draconic-dragonborn-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['draconic-dragonborn-place-root-pool', 'draconic-dragonborn-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
