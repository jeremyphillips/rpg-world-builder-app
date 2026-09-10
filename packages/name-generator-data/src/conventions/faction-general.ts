import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const factionGeneralConvention = {
  id: 'faction-general',
  label: 'General faction names',
  description: 'Template-based faction and organization names.',
  subjectKinds: ['faction', 'organization'],
  associations: [],
  structures: [
    {
      id: 'guild-style',
      label: 'Guild style',
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
    {
      id: 'emblem-style',
      label: 'Emblem style',
      parts: [
        { key: 'emblem', role: 'emblem', required: true },
        { key: 'organizationType', role: 'organizationType', required: true },
      ],
      format: 'The {emblem} {organizationType}',
    },
    {
      id: 'descriptor-emblem',
      label: 'Descriptor and emblem',
      parts: [
        { key: 'descriptor', role: 'descriptor', required: true },
        { key: 'emblem', role: 'emblem', required: true },
      ],
      format: '{descriptor} {emblem}',
    },
  ],
  partBindings: [
    { partKey: 'descriptor', collectionId: 'faction-descriptor-pool', sourceKey: 'descriptor' },
    {
      partKey: 'organizationType',
      collectionId: 'faction-org-type-pool',
      sourceKey: 'organizationType',
    },
    { partKey: 'emblem', collectionId: 'faction-emblem-pool', sourceKey: 'emblem' },
  ],
  collectionIds: ['faction-descriptor-pool', 'faction-org-type-pool', 'faction-emblem-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  tags: ['guild', 'criminal'],
  version: 1,
} as const satisfies NamingConvention
