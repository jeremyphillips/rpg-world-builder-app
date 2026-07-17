import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicDragonbornPersonalConvention = {
  id: 'draconic-dragonborn-personal',
  label: 'Draconic dragonborn personal names',
  description: 'Given and clan names for dragonborn characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'draconic', strength: 'primary' },
    { kind: 'culture', cultureId: 'draconic-dragonborn', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:dragonborn' },
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
    { partKey: 'given', collectionId: 'draconic-dragonborn-given-pool', sourceKey: 'given' },
    { partKey: 'clan', collectionId: 'draconic-dragonborn-clan-pool', sourceKey: 'clan' },
  ],
  collectionIds: ['draconic-dragonborn-given-pool', 'draconic-dragonborn-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
