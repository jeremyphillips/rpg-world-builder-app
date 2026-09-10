import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const romanSettlementDefinition = {
  key: 'settlement',
  id: 'roman-settlement',
  label: 'Roman settlement names',
  description: 'Settlement names built from Latin prefixes such as Colonia and Castra.',
  structures: [
    {
      id: 'prefix-place',
      label: 'Prefix and root',
      parts: [
        { key: 'placePrefix', role: 'placePrefix', required: true },
        { key: 'placeRoot', role: 'placeRoot', required: true },
      ],
      format: '{placePrefix} {placeRoot}',
    },
  ],
  partBindings: [
    {
      partKey: 'placePrefix',
      collectionId: 'roman-place-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'roman-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['roman-place-prefix-pool', 'roman-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
