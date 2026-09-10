import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dwarfFactionDefinition = {
  key: 'faction',
  id: 'dwarven-faction',
  label: 'Mountain Dwarven guild names',
  description: 'Guild, hold, and muster names for dwarven factions and organizations.',
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
      id: 'emblem-charter',
      label: 'Organization of the emblem',
      parts: [
        { key: 'organizationType', role: 'organizationType', required: true },
        { key: 'descriptor', role: 'descriptor', required: true },
        { key: 'emblem', role: 'emblem', required: true },
      ],
      format: '{organizationType} of the {descriptor} {emblem}',
    },
  ],
  partBindings: [
    { partKey: 'descriptor', collectionId: 'faction-descriptor-pool', sourceKey: 'descriptor' },
    {
      partKey: 'organizationType',
      collectionId: 'dwarven-org-type-pool',
      sourceKey: 'organizationType',
    },
    { partKey: 'emblem', collectionId: 'faction-emblem-pool', sourceKey: 'emblem' },
  ],
  collectionIds: ['faction-descriptor-pool', 'dwarven-org-type-pool', 'faction-emblem-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  tags: ['guild', 'hold'],
  version: 1,
} as const satisfies NamingConventionDefinition
