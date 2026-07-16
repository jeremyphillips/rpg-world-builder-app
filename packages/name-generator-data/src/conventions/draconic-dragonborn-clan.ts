import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const draconicDragonbornClanConvention = {
  id: 'draconic-dragonborn-clan',
  label: 'Draconic-influenced dragonborn clan names',
  description: 'Clan names for dragonborn with draconic linguistic influence.',
  subjectKinds: ['clan', 'family'],
  associations: [
    { kind: 'language', languageId: 'draconic', strength: 'influenced' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:dragonborn' },
  ],
  structures: [
    {
      id: 'clan-only',
      label: 'Clan name',
      parts: [{ key: 'clan', role: 'clan', required: true }],
      format: '{clan}',
    },
  ],
  partBindings: [{ partKey: 'clan', collectionId: 'draconic-clan-pool', sourceKey: 'clan' }],
  collectionIds: ['draconic-clan-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
