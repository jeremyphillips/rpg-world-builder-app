import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const dwarvenSettlementPoolCollection = {
  id: 'dwarven-settlement-pool',
  label: 'Dwarven settlement compounds',
  description: 'Fixture compound generator for mountain-dwarf hold names.',
  subjectKinds: ['settlement'],
  generator: {
    type: 'compound',
    parts: [{ pool: 'root' }, { pool: 'suffix', separator: ' ' }],
    pools: {
      root: ['Anvil', 'Deep', 'Grim', 'Hammer', 'Iron', 'Stone'],
      suffix: ['barrow', 'delve', 'forge', 'gate', 'heim', 'hold'],
    },
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
