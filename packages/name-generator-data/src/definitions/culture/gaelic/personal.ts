import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const gaelicPersonalDefinition = {
  key: 'personal',
  id: 'gaelic-personal',
  label: 'Gaelic personal names',
  description: 'Gaelic personal naming with O/Mac versus Ni/Nic patronyms and hereditary surnames.',
  structures: [
    {
      id: 'patronymic',
      label: 'Given and patronym',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'particle', role: 'patronym', required: true },
        { key: 'ancestor', role: 'given', required: true },
      ],
      format: '{given} {particle} {ancestor}',
    },
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
    { partKey: 'given', collectionId: 'gaelic-given-pool' },
    { partKey: 'particle', collectionId: 'gaelic-patronym-particle-pool' },
    { partKey: 'ancestor', collectionId: 'gaelic-given-pool', sourceKey: 'given-masc' },
    { partKey: 'family', collectionId: 'gaelic-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['gaelic-given-pool', 'gaelic-patronym-particle-pool', 'gaelic-family-pool'],
  provenance: {
    ...FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
    notes:
      'Ancestor names appear in nominative form rather than the genitive or lenited forms real Gaelic surnames use.',
  },
  version: 1,
} as const satisfies NamingConventionDefinition
