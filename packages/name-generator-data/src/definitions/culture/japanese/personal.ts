import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const japanesePersonalDefinition = {
  key: 'personal',
  id: 'japanese-personal',
  label: 'Japanese personal names',
  description: 'Family-first Japanese personal naming with given names.',
  structures: [
    {
      id: 'full',
      label: 'Family and given',
      parts: [
        { key: 'family', role: 'family', required: true },
        { key: 'given', role: 'given', required: true },
      ],
      format: '{family} {given}',
    },
  ],
  partBindings: [
    { partKey: 'family', collectionId: 'japanese-family-pool', sourceKey: 'family' },
    { partKey: 'given', collectionId: 'japanese-given-pool' },
  ],
  collectionIds: ['japanese-family-pool', 'japanese-given-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
