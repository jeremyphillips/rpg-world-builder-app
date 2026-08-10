import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const factionDescriptorPoolCollection = {
  id: 'faction-descriptor-pool',
  label: 'Faction descriptors',
  description: 'Fixture epithet-like descriptors for organizations and factions.',
  subjectKinds: ['faction', 'organization'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'descriptor',
        role: 'descriptor',
        values: ['Ashen', 'Crimson', 'Golden', 'Iron', 'Night', 'Silent', 'Veiled'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
