import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const arabicSettlementDefinition = {
  key: 'settlement',
  id: 'arabic-settlement',
  label: 'Arabic settlement names',
  description: 'Settlement names built from Arabic prefixes such as Dar al- and Bab al-.',
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
      collectionId: 'arabic-place-prefix-pool',
      sourceKey: 'placePrefix',
    },
    { partKey: 'placeRoot', collectionId: 'arabic-place-root-pool', sourceKey: 'placeRoot' },
  ],
  collectionIds: ['arabic-place-prefix-pool', 'arabic-place-root-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
