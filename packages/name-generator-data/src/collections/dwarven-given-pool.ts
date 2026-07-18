import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const dwarvenGivenPoolCollection = {
  id: 'dwarven-given-pool',
  label: 'Dwarven given names',
  description: 'Fixture given-name pool for mountain-dwarf personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: [
          'Adrik',
          'Baern',
          'Brottor',
          'Darrak',
          'Fargrim',
          'Flint',
          'Harbek',
          'Morgran',
          'Rurik',
          'Thorin',
        ],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: [
          'Amber',
          'Audhild',
          'Bardryn',
          'Diesa',
          'Eldeth',
          'Falkrunn',
          'Gunnloda',
          'Kathra',
          'Torgga',
          'Vistra',
        ],
      },
      {
        id: 'given-neutral',
        role: 'given',
        genderStyle: 'neutral',
        values: [
          'Artin',
          'Dagnal',
          'Delg',
          'Eberk',
          'Gardain',
          'Harbin',
          'Kildrak',
          'Orsik',
          'Tordek',
          'Ulfgar',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
