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
        values: ['Alston', 'Eldon', 'Gimble', 'Namfoodle', 'Roondar', 'Seebo', 'Warryn'],
      },
      {
        id: 'given-fem',
        role: 'given',
        genderStyle: 'feminine',
        values: ['Breena', 'Carlin', 'Lorilla', 'Mardnab', 'Royma', 'Tana', 'Waywocket'],
      },
      {
        id: 'given-neutral',
        role: 'given',
        genderStyle: 'neutral',
        values: ['Boddynock', 'Dimble', 'Fonkin', 'Glim', 'Jebeddo', 'Zook'],
      },
    ],
  },
  provenance: FIXTURE_COLLECTION_PROVENANCE.fictionalOriginal,
  version: 1,
} as const satisfies NameCollection
