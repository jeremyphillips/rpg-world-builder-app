import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const elvishPersonalConvention = {
  id: 'elvish-personal',
  label: 'Elven personal names',
  description: 'Given and family names for elven characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'elvish', strength: 'primary' },
    { kind: 'culture', cultureId: 'elven-general', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:elf' },
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
    { partKey: 'given', collectionId: 'elvish-given-pool' },
    { partKey: 'family', collectionId: 'elvish-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['elvish-given-pool', 'elvish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
