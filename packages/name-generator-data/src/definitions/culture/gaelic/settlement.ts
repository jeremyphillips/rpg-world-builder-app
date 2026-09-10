import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const gaelicSettlementDefinition = {
  key: 'settlement',
  id: 'gaelic-settlement',
  label: 'Gaelic settlement names',
  description: 'Settlement names built from Gaelic place prefixes and roots.',
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
      collectionId: 'gaelic-place-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'gaelic-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['gaelic-place-prefix-pool', 'gaelic-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
