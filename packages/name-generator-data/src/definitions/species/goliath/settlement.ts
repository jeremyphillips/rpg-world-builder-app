import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const goliathSettlementDefinition = {
  key: 'settlement',
  id: 'goliath-settlement',
  label: 'Giant Goliath settlement names',
  description: 'Settlement names built from goliath place roots and settlement suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'goliath-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'goliath-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['goliath-place-root-pool', 'goliath-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
