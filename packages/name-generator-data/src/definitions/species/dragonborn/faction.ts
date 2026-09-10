import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const dragonbornFactionDefinition = {
  key: 'faction',
  id: 'draconic-dragonborn-faction',
  label: 'Draconic dragonborn flight names',
  description: 'Flight, clutch, and brood names for dragonborn factions and organizations.',
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
      collectionId: 'draconic-dragonborn-org-type-pool',
      sourceKey: 'organizationType',
    },
    { partKey: 'emblem', collectionId: 'faction-emblem-pool', sourceKey: 'emblem' },
  ],
  collectionIds: [
    'faction-descriptor-pool',
    'draconic-dragonborn-org-type-pool',
    'faction-emblem-pool',
  ],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  tags: ['flight', 'clutch'],
  version: 1,
} as const satisfies NamingConventionDefinition
