import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const goliathClanDefinition = {
  key: 'clan',
  id: 'goliath-clan',
  label: 'Giant Goliath clan names',
  description: 'Clan names for goliath kin groups as a standalone subject.',
  subjectKinds: ['clan', 'family'],
  structures: [
    {
      id: 'clan-only',
      label: 'Clan name',
      parts: [{ key: 'clan', role: 'clan', required: true }],
      format: '{clan}',
    },
  ],
  partBindings: [{ partKey: 'clan', collectionId: 'goliath-clan-pool', sourceKey: 'clan' }],
  collectionIds: ['goliath-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
