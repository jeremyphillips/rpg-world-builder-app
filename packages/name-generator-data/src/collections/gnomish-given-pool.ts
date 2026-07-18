import type { NameCollection } from '@rpg/contracts/name-generator'

import { FIXTURE_COLLECTION_PROVENANCE } from '../lib/provenance'

export const gnomishGivenPoolCollection = {
  id: 'gnomish-given-pool',
  label: 'Gnomish given names',
  description: 'Fixture given-name pool for common-gnome personal conventions.',
  subjectKinds: ['person'],
  generator: {
    type: 'sample',
    pools: [
      {
        id: 'given-masc',
        role: 'given',
        genderStyle: 'masculine',
        values: [
          'Alston',
          'Alvyn',
          'Brocc',
          'Eldon',
          'Frug',
          'Gimble',
          'Namfoodle',
          'Roondar',
          'Seebo',
          'Warryn',
        ],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: [
          'Breena',
          'Carlin',
          'Donella',
          'Ellyjobell',
          'Lorilla',
          'Mardnab',
          'Royma',
          'Shamil',
          'Tana',
          'Waywocket',
        ],
      },
      {
        id: 'given-neutral',
        role: 'given',
        genderStyle: 'neutral',
        values: [
          'Boddynock',
          'Burgell',
          'Dimble',
          'Fonkin',
          'Glim',
          'Jebeddo',
          'Kellen',
          'Orryn',
          'Wrenn',
          'Zook',
        ],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
