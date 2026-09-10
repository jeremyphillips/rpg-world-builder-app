import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const yorubaSettlementDefinition = {
  key: 'settlement',
  id: 'yoruba-settlement',
  label: 'Yoruba settlement names',
  description: 'Settlement names built from Yoruba place prefixes and roots.',
  structures: [
    {
      id: 'prefix-place',
      label: 'Prefix and root',
      parts: [
        { key: 'placePrefix', role: 'placePrefix', required: true },
        { key: 'placeRoot', role: 'placeRoot', required: true },
      ],
      format: '{placePrefix}{placeRoot}',
    },
  ],
  partBindings: [
    {
      partKey: 'placePrefix',
      collectionId: 'yoruba-place-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'yoruba-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['yoruba-place-prefix-pool', 'yoruba-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
