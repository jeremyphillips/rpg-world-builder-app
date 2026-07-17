import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const akanPersonalConvention = {
  id: 'akan-personal',
  label: 'Akan personal names',
  description: 'Historical akan personal naming with given and family structure.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'culture', cultureId: 'akan', strength: 'primary' },
    { kind: 'region', regionId: 'west-africa' },
  ],
  structures: [
    {
      id: 'full',
      label: 'Given and family',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'family', role: 'family', required: true },
      ],
      format: '{given} {family}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'akan-given-pool', sourceKey: 'given-masc' },
    { partKey: 'family', collectionId: 'akan-family-pool', sourceKey: 'family' },
  ],
  collectionIds: ['akan-given-pool', 'akan-family-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConvention
