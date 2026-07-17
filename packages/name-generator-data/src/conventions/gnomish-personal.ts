import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const gnomishPersonalConvention = {
  id: 'gnomish-personal',
  label: 'Common Gnomish personal names',
  description: 'Given and family names for common-gnome characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'gnomish', strength: 'primary' },
    { kind: 'culture', cultureId: 'common-gnome', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:gnome' },
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
    { partKey: 'given', collectionId: 'gnomish-given-pool', sourceKey: 'given-masc' },
    { partKey: 'family', collectionId: 'gnomish-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['gnomish-given-pool', 'gnomish-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
