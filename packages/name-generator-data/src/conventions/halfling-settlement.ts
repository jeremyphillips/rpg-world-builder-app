import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const halflingSettlementConvention = {
  id: 'halfling-settlement',
  label: 'Common Halfling settlement names',
  description: 'Settlement names sharing halfling linguistic pools with personal conventions.',
  subjectKinds: ['settlement', 'landmark'],
  associations: [
    { kind: 'language', languageId: 'halfling', strength: 'primary' },
    { kind: 'culture', cultureId: 'halfling', strength: 'primary' },
  ],
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
    { partKey: 'placeRoot', collectionId: 'halfling-place-root-pool', sourceKey: 'placeRoot' },
    {
      partKey: 'placeSuffix',
      collectionId: 'halfling-place-suffix-pool',
      sourceKey: 'placeSuffix',
    },
  ],
  collectionIds: ['halfling-place-root-pool', 'halfling-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
