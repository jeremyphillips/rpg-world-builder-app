import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const dwarvenSettlementConvention = {
  id: 'dwarven-settlement',
  label: 'Mountain Dwarven settlement names',
  description: 'Hold-style settlement names for dwarf communities.',
  subjectKinds: ['settlement'],
  associations: [
    { kind: 'language', languageId: 'dwarvish', strength: 'primary' },
    { kind: 'culture', cultureId: 'dwarf', strength: 'primary' },
  ],
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
} as const satisfies NamingConvention
