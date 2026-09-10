import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const norsePersonalDefinition = {
  key: 'personal',
  id: 'norse-personal',
  label: 'Norse personal names',
  description: 'Old Norse personal naming with patronymics and bynames. No hereditary surnames.',
  structures: [
    {
      id: 'patronymic',
      label: 'Given and patronym',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'patronymRoot', role: 'given', required: true },
        { key: 'patronymSuffix', role: 'patronym', required: true },
      ],
      format: '{given} {patronymRoot}{patronymSuffix}',
    },
    {
      id: 'byname',
      label: 'Given and byname',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'epithet', role: 'epithet', required: true },
      ],
      format: '{given} {epithet}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'norse-given-pool' },
    { partKey: 'patronymRoot', collectionId: 'norse-given-pool', sourceKey: 'given-masc' },
    { partKey: 'patronymSuffix', collectionId: 'norse-patronym-suffix-pool' },
    { partKey: 'epithet', collectionId: 'norse-byname-pool', sourceKey: 'epithet' },
  ],
  collectionIds: ['norse-given-pool', 'norse-patronym-suffix-pool', 'norse-byname-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
