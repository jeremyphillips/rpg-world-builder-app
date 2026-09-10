import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const tieflingSettlementDefinition = {
  key: 'settlement',
  id: 'infernal-tiefling-settlement',
  label: 'Infernal Tiefling settlement names',
  description: 'Settlement names built from infernal tiefling place roots and settlement suffixes.',
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
      collectionId: 'infernal-tiefling-place-root-pool',
      sourceKey: 'placeRoot',
    },
    {
      partKey: 'placeSuffix',
      collectionId: 'infernal-tiefling-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['infernal-tiefling-place-root-pool', 'infernal-tiefling-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
