import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const halflingPersonalConvention = {
  id: 'halfling-personal',
  label: 'Common Halfling personal names',
  description: 'Given and family names for common-halfling characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'halfling', strength: 'primary' },
    { kind: 'culture', cultureId: 'common-halfling', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:halfling' },
  ],
  structures: [
    {
      id: 'full',
      label: 'Given and family',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'family', role: 'family', required: true },
      ],
      format: '{given} {family}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'halfling-given-pool' },
    { partKey: 'family', collectionId: 'halfling-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['halfling-given-pool', 'halfling-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
