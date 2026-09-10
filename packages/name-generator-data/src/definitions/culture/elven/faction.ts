import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const elvenFactionDefinition = {
  key: 'faction',
  id: 'elvish-faction',
  label: 'Elven circle names',
  description: 'Circle, court, and grove names for elven factions and organizations.',
  structures: [
    {
      id: 'guild-style',
      label: 'Descriptor and organization',
      parts: [
        { key: 'descriptor', role: 'descriptor', required: true },
        { key: 'organizationType', role: 'organizationType', required: true },
      ],
      format: 'The {descriptor} {organizationType}',
    },
    {
      id: 'emblem-style',
      label: 'Emblem and organization',
      parts: [
        { key: 'emblem', role: 'emblem', required: true },
        { key: 'organizationType', role: 'organizationType', required: true },
      ],
      format: 'The {emblem} {organizationType}',
    },
  ],
  partBindings: [
    { partKey: 'descriptor', collectionId: 'faction-descriptor-pool', sourceKey: 'descriptor' },
    {
      partKey: 'organizationType',
      collectionId: 'elvish-org-type-pool',
      sourceKey: 'organizationType',
    },
    { partKey: 'emblem', collectionId: 'faction-emblem-pool', sourceKey: 'emblem' },
  ],
  collectionIds: ['faction-descriptor-pool', 'elvish-org-type-pool', 'faction-emblem-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  tags: ['circle', 'court'],
  version: 1,
} as const satisfies NamingConventionDefinition
