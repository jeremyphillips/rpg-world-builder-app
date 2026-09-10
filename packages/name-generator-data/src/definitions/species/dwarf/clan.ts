import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dwarfClanDefinition = {
  key: 'clan',
  id: 'dwarven-clan',
  label: 'Mountain Dwarven clan names',
  description: 'Clan names for dwarven kin groups as a standalone subject.',
  subjectKinds: ['clan', 'family'],
  structures: [
    {
      id: 'clan-only',
      label: 'Clan name',
      parts: [{ key: 'clan', role: 'clan', required: true }],
      format: '{clan}',
    },
  ],
  partBindings: [{ partKey: 'clan', collectionId: 'dwarven-clan-pool', sourceKey: 'clan' }],
  collectionIds: ['dwarven-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
