import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const dwarvenPersonalConvention = {
  id: 'dwarven-personal',
  label: 'Mountain Dwarven personal names',
  description: 'Given and clan names for mountain-dwarf characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'dwarvish', strength: 'primary' },
    { kind: 'culture', cultureId: 'mountain-dwarf', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:dwarf' },
  ],
  structures: [
    {
      id: 'full',
      label: 'Given and clan',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'clan', role: 'clan', required: true },
      ],
      format: '{given} {clan}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'dwarven-given-pool', sourceKey: 'given-masc' },
    { partKey: 'clan', collectionId: 'dwarven-clan-pool', sourceKey: 'clan' },
  ],
  collectionIds: ['dwarven-given-pool', 'dwarven-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
