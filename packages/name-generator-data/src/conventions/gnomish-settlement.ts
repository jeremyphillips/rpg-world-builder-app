import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const gnomishSettlementConvention = {
  id: 'gnomish-settlement',
  label: 'Common Gnomish settlement names',
  description: 'Settlement names sharing gnomish linguistic pools with personal conventions.',
  subjectKinds: ['settlement', 'landmark'],
  associations: [
    { kind: 'language', languageId: 'gnomish', strength: 'primary' },
    { kind: 'culture', cultureId: 'common-gnome', strength: 'primary' },
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
    { partKey: 'placeRoot', collectionId: 'gnomish-place-root-pool', sourceKey: 'placeRoot' },
    { partKey: 'placeSuffix', collectionId: 'gnomish-place-suffix-pool', sourceKey: 'placeSuffix' },
  ],
  collectionIds: ['gnomish-place-root-pool', 'gnomish-place-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
