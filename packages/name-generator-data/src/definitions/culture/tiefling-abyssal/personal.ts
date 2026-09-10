import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const tieflingAbyssalPersonalDefinition = {
  key: 'personal',
  id: 'abyssal-tiefling-personal',
  label: 'Abyssal Tiefling personal names',
  description: 'Single given names for tieflings of the abyssal legacy.',
  structures: [
    {
      id: 'given-only',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
  ],
  partBindings: [{ partKey: 'given', collectionId: 'abyssal-tiefling-given-pool' }],
  collectionIds: ['abyssal-tiefling-given-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
