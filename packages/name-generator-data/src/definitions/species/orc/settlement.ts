import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const orcSettlementDefinition = {
  key: 'settlement',
  id: 'orc-settlement',
  label: 'Common Orc settlement names',
  description: 'Settlement names built from orc place roots and settlement suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'orc-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'orc-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['orc-place-root-pool', 'orc-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
