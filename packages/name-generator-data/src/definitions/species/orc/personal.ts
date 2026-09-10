import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const orcPersonalDefinition = {
  key: 'personal',
  id: 'orc-personal',
  label: 'Common Orc personal names',
  description: 'Given names, with optional clan names, for orc characters.',
  structures: [
    {
      id: 'given-only',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
    {
      id: 'given-clan',
      label: 'Given and clan',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'clan', role: 'clan', required: true },
      ],
      format: '{given} {clan}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'orc-given-pool' },
    { partKey: 'clan', collectionId: 'orc-clan-pool', sourceKey: 'clan' },
  ],
  collectionIds: ['orc-given-pool', 'orc-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
