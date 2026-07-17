import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const infernalTieflingPersonalConvention = {
  id: 'infernal-tiefling-personal',
  label: 'Infernal Tiefling personal names',
  description: 'Given names with optional virtue surnames for tiefling characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'infernal', strength: 'influenced' },
    { kind: 'culture', cultureId: 'infernal-tiefling', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:tiefling' },
  ],
  structures: [
    {
      id: 'given-only',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
    {
      id: 'given-virtue',
      label: 'Given and virtue',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'virtue', role: 'epithet', required: true },
      ],
      format: '{given} {virtue}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'infernal-tiefling-given-pool' },
    { partKey: 'virtue', collectionId: 'infernal-tiefling-virtue-pool', sourceKey: 'virtue' },
  ],
  collectionIds: ['infernal-tiefling-given-pool', 'infernal-tiefling-virtue-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
