import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const orcClanDefinition = {
  key: 'clan',
  id: 'orc-clan',
  label: 'Common Orc clan names',
  description: 'Clan names for orc kin groups as a standalone subject.',
  subjectKinds: ['clan', 'family'],
  structures: [
    {
      id: 'clan-only',
      label: 'Clan name',
      parts: [{ key: 'clan', role: 'clan', required: true }],
      format: '{clan}',
    },
  ],
  partBindings: [{ partKey: 'clan', collectionId: 'orc-clan-pool', sourceKey: 'clan' }],
  collectionIds: ['orc-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
