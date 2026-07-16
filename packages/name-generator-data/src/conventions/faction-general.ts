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
  ],
  partBindings: [
    { partKey: 'descriptor', collectionId: 'faction-descriptor-pool', sourceKey: 'descriptor' },
    {
      partKey: 'organizationType',
      collectionId: 'faction-org-type-pool',
      sourceKey: 'organizationType',
    },
  ],
  collectionIds: ['faction-descriptor-pool', 'faction-org-type-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  tags: ['guild', 'criminal'],
  version: 1,
} as const satisfies NamingConvention
