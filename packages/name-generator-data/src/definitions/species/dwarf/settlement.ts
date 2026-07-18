import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dwarfSettlementDefinition = {
  key: 'settlement',
  id: 'dwarven-settlement',
  label: 'Mountain Dwarven settlement names',
  description: 'Hold-style settlement names for dwarf communities.',
  structures: [
    {
      id: 'hold',
      label: 'Hold compound',
      parts: [{ key: 'place', role: 'placeRoot', required: true }],
      format: '{place}',
    },
  ],
  partBindings: [{ partKey: 'place', collectionId: 'dwarven-settlement-pool' }],
  collectionIds: ['dwarven-settlement-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
