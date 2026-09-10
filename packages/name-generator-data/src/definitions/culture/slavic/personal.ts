import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const slavicPersonalDefinition = {
  key: 'personal',
  id: 'slavic-personal',
  label: 'Slavic personal names',
  description: 'East Slavic personal naming with gendered patronymics and family names.',
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
      id: 'full',
      label: 'Given and family',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'familyRoot', role: 'family', required: true },
        { key: 'familySuffix', role: 'family', required: true },
      ],
      format: '{given} {familyRoot}{familySuffix}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'slavic-given-pool' },
    { partKey: 'patronymRoot', collectionId: 'slavic-given-pool', sourceKey: 'given-masc' },
    { partKey: 'patronymSuffix', collectionId: 'slavic-patronym-suffix-pool' },
    { partKey: 'familyRoot', collectionId: 'slavic-family-root-pool', sourceKey: 'familyRoot' },
    { partKey: 'familySuffix', collectionId: 'slavic-family-suffix-pool' },
  ],
  collectionIds: [
    'slavic-given-pool',
    'slavic-patronym-suffix-pool',
    'slavic-family-root-pool',
    'slavic-family-suffix-pool',
  ],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
