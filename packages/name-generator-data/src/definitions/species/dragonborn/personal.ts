import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dragonbornPersonalDefinition = {
  key: 'personal',
  id: 'draconic-dragonborn-personal',
  label: 'Draconic dragonborn personal names',
  description: 'Given and clan names for dragonborn characters.',
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
} as const satisfies NamingConventionDefinition
