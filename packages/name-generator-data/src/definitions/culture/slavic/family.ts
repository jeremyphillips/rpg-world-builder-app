import type { NamingConventionDefinition } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../../../lib/provenance'

export const slavicFamilyDefinition = {
  key: 'family',
  id: 'slavic-family',
  label: 'Slavic family names',
  description: 'Gender-inflected Slavic family names built from a root and -ov/-sky suffix.',
  structures: [
    {
      id: 'inflected-family',
      label: 'Root and suffix',
      parts: [
        { key: 'familyRoot', role: 'family', required: true },
        { key: 'familySuffix', role: 'family', required: true },
      ],
      format: '{familyRoot}{familySuffix}',
    },
  ],
  partBindings: [
    { partKey: 'familyRoot', collectionId: 'slavic-family-root-pool', sourceKey: 'familyRoot' },
    { partKey: 'familySuffix', collectionId: 'slavic-family-suffix-pool' },
  ],
  collectionIds: ['slavic-family-root-pool', 'slavic-family-suffix-pool'],
  provenance: FIXTURE_COLLECTION_PROVENANCE.conventionCuration,
  version: 1,
} as const satisfies NamingConventionDefinition
