import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const slavicSettlementDefinition = {
  key: 'settlement',
  id: 'slavic-settlement',
  label: 'Slavic settlement names',
  description: 'Settlement names built from Slavic place roots and -grad/-gorod suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'slavic-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'slavic-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['slavic-place-root-pool', 'slavic-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
