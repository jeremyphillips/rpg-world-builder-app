import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const hanChinesePersonalDefinition = {
  key: 'personal',
  id: 'han-chinese-personal',
  label: 'Han Chinese personal names',
  description: 'Family-first Han Chinese personal naming with two-morpheme given names.',
  structures: [
    {
      id: 'full',
      label: 'Family and given',
      parts: [
        { key: 'family', role: 'family', required: true },
        { key: 'given', role: 'given', required: true },
      ],
      format: '{family} {given}',
    },
  ],
  partBindings: [
    { partKey: 'family', collectionId: 'han-chinese-family-pool', sourceKey: 'family' },
    { partKey: 'given', collectionId: 'han-chinese-given-pool' },
  ],
  collectionIds: ['han-chinese-family-pool', 'han-chinese-given-pool'],
  provenance: {
    ...FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
    notes: 'Pinyin romanization without tone marks.',
  },
  version: 1,
} as const satisfies NamingConventionDefinition
