import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const tieflingChthonicPersonalDefinition = {
  key: 'personal',
  id: 'chthonic-tiefling-personal',
  label: 'Chthonic Tiefling personal names',
  description: 'Single given names for tieflings of the chthonic legacy.',
  structures: [
    {
      id: 'given-only',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
  ],
  partBindings: [{ partKey: 'given', collectionId: 'chthonic-tiefling-given-pool' }],
  collectionIds: ['chthonic-tiefling-given-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
