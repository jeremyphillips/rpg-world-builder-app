import type { NamingConvention } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const orcPersonalConvention = {
  id: 'orc-personal',
  label: 'Common Orc personal names',
  description: 'Given names for common-orc characters.',
  subjectKinds: ['person'],
  associations: [
    { kind: 'language', languageId: 'orc', strength: 'primary' },
    { kind: 'culture', cultureId: 'common-orc', strength: 'primary' },
    { kind: 'species', speciesId: 'srd-cc-5.2.1:orc' },
  ],
  structures: [
    {
      id: 'given-only',
      label: 'Given only',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
  ],
  partBindings: [{ partKey: 'given', collectionId: 'orc-given-pool' }],
  collectionIds: ['orc-given-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConvention
