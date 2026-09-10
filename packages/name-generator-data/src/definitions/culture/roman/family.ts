import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const romanFamilyDefinition = {
  key: 'family',
  id: 'roman-family',
  label: 'Roman family names',
  description: 'Gentile names for Roman households as a standalone subject.',
  structures: [
    {
      id: 'nomen-only',
      label: 'Nomen',
      parts: [{ key: 'nomen', role: 'family', required: true }],
      format: '{nomen}',
    },
  ],
  partBindings: [{ partKey: 'nomen', collectionId: 'roman-nomen-pool' }],
  collectionIds: ['roman-nomen-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
