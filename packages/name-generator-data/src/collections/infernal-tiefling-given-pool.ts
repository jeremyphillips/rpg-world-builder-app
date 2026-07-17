import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const infernalTieflingGivenPoolCollection = {
  id: 'infernal-tiefling-given-pool',
  label: 'Infernal tiefling given names',
  description: 'Fixture given-name pool for infernal-tiefling personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Kairon', 'Morthos', 'Therai'],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: ['Akta', 'Anakis', 'Bryseis', 'Damaia', 'Kallista', 'Lerissa', 'Rieta'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
