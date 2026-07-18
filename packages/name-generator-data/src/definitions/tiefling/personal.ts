import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../lib/provenance'

export const tieflingPersonalDefinition = {
  key: 'personal',
  id: 'infernal-tiefling-personal',
  label: 'Infernal Tiefling personal names',
  description: 'Given names with optional virtue surnames for tiefling characters.',
  associations: [{ kind: 'language', languageId: 'infernal', strength: 'influenced' }],
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
        { key: 'virtue', role: 'virtue', required: true },
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
} as const satisfies NamingConventionDefinition
