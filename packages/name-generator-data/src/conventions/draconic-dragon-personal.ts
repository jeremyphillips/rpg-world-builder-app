import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicDragonPersonalConvention = {
  id: 'draconic-dragon-personal',
  label: 'Draconic dragon personal names',
  description: 'Personal names for true dragons using draconic language affinity.',
  subjectKinds: ['person', 'creature'],
  associations: [
    { kind: 'language', languageId: 'draconic', strength: 'primary' },
    { kind: 'creatureType', creatureType: 'dragon' },
  ],
  structures: [
    {
      id: 'single',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
  ],
  partBindings: [{ partKey: 'given', collectionId: 'draconic-personal-pool', sourceKey: 'given' }],
  collectionIds: ['draconic-personal-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
