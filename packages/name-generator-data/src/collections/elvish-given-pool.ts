import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const elvishGivenPoolCollection = {
  id: 'elvish-given-pool',
  label: 'Elvish given names',
  description: 'Fixture given-name pool for high-elven personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: ['Aelar', 'Adran', 'Aramil', 'Erevan', 'Galinndan', 'Heian', 'Lucan'],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: ['Adrie', 'Althaea', 'Ilyrana', 'Meriele', 'Naivara', 'Quelenna', 'Sariel'],
      },
      {
        id: 'given-neutral',
        role: 'given',
        genderStyle: 'neutral',
        values: ['Aerendyl', 'Lhoris', 'Rael', 'Sylvar', 'Theren'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
