import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../lib/provenance'

export const dragonbornClanDefinition = {
  key: 'clan',
  id: 'draconic-dragonborn-clan',
  label: 'Draconic dragonborn clan names',
  description: 'Clan names for dragonborn communities as a standalone subject.',
  subjectKinds: ['clan', 'family'],
  structures: [
    {
      id: 'clan-only',
      label: 'Clan name',
      parts: [{ key: 'clan', role: 'clan', required: true }],
      format: '{clan}',
    },
  ],
  partBindings: [
    { partKey: 'clan', collectionId: 'draconic-dragonborn-clan-pool', sourceKey: 'clan' },
  ],
  collectionIds: ['draconic-dragonborn-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
