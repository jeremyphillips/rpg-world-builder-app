import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const angloSaxonSettlementDefinition = {
  key: 'settlement',
  id: 'anglo-saxon-settlement',
  label: 'Anglo-Saxon settlement names',
  description: 'Settlement names built from Old English place roots and -ton/-ham suffixes.',
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
    { partKey: 'placeRoot', collectionId: 'anglo-saxon-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'anglo-saxon-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['anglo-saxon-place-root-pool', 'anglo-saxon-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
