import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const elvishSettlementConvention = {
  id: 'elvish-settlement',
  label: 'Elven settlement names',
  description: 'Settlement names sharing elvish linguistic pools with personal conventions.',
  subjectKinds: ['settlement', 'landmark'],
  associations: [
    { kind: 'language', languageId: 'elvish', strength: 'primary' },
    { kind: 'culture', cultureId: 'elven-general', strength: 'primary' },
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
    { partKey: 'placeRoot', collectionId: 'elvish-place-root-pool', sourceKey: 'placeRoot' },
    { partKey: 'placeSuffix', collectionId: 'elvish-place-suffix-pool', sourceKey: 'placeSuffix' },
  ],
  collectionIds: ['elvish-place-root-pool', 'elvish-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
