import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const goliathPersonalDefinition = {
  key: 'personal',
  id: 'goliath-personal',
  label: 'Giant Goliath personal names',
  description: 'Birth name, earned epithet, and clan name for goliath characters.',
  structures: [
    {
      id: 'full',
      label: 'Birth name, epithet, and clan',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'epithet', role: 'epithet', required: true },
        { key: 'clan', role: 'clan', required: true },
      ],
      format: '{given} "{epithet}" {clan}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'goliath-given-pool', sourceKey: 'given' },
    { partKey: 'epithet', collectionId: 'goliath-epithet-pool', sourceKey: 'epithet' },
    { partKey: 'clan', collectionId: 'goliath-clan-pool', sourceKey: 'clan' },
  ],
  collectionIds: ['goliath-given-pool', 'goliath-epithet-pool', 'goliath-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
