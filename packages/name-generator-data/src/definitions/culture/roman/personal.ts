import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const romanPersonalDefinition = {
  key: 'personal',
  id: 'roman-personal',
  label: 'Roman personal names',
  description: 'Republican Roman tria nomina with praenomen, gender-inflected nomen, and cognomen.',
  structures: [
    {
      id: 'duo-nomina',
      label: 'Praenomen and nomen',
      parts: [
        { key: 'praenomen', role: 'given', required: true },
        { key: 'nomen', role: 'family', required: true },
      ],
      format: '{praenomen} {nomen}',
    },
    {
      id: 'tria-nomina',
      label: 'Praenomen, nomen, and cognomen',
      parts: [
        { key: 'praenomen', role: 'given', required: true },
        { key: 'nomen', role: 'family', required: true },
        { key: 'cognomen', role: 'epithet', required: true },
      ],
      format: '{praenomen} {nomen} {cognomen}',
    },
  ],
  partBindings: [
    { partKey: 'praenomen', collectionId: 'roman-praenomen-pool' },
    { partKey: 'nomen', collectionId: 'roman-nomen-pool' },
    { partKey: 'cognomen', collectionId: 'roman-cognomen-pool', sourceKey: 'epithet' },
  ],
  collectionIds: ['roman-praenomen-pool', 'roman-nomen-pool', 'roman-cognomen-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
