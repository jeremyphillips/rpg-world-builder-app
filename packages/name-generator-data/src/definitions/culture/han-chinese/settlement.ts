import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const hanChineseSettlementDefinition = {
  key: 'settlement',
  id: 'han-chinese-settlement',
  label: 'Han Chinese settlement names',
  description: 'Settlement names built from Chinese place roots and -zhou/-cheng suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'han-chinese-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'han-chinese-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['han-chinese-place-root-pool', 'han-chinese-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
