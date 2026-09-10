import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const angloSaxonPersonalDefinition = {
  key: 'personal',
  id: 'anglo-saxon-personal',
  label: 'Anglo-Saxon personal names',
  description: 'Dithematic Old English given names with optional bynames.',
  structures: [
    {
      id: 'given-only',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
    {
      id: 'given-byname',
      label: 'Given and byname',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'epithet', role: 'epithet', required: true },
      ],
      format: '{given} {epithet}',
    },
  ],
  partBindings: [
    { partKey: 'given', collectionId: 'anglo-saxon-given-pool' },
    { partKey: 'epithet', collectionId: 'anglo-saxon-byname-pool', sourceKey: 'epithet' },
  ],
  collectionIds: ['anglo-saxon-given-pool', 'anglo-saxon-byname-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.historicalCurated,
  version: 1,
} as const satisfies NamingConventionDefinition
