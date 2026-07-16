import type { NameCollectionProvenance } from '@rpg/contracts/name-generator'

export const FIXTURE_COLLECTION_PROVENANCE = {
  fictionalOriginal: {
    sourceName: 'RPG World Builder original fixture',
    license: 'original',
    methodology: 'original-fictional',
  },
  historicalCurated: {
    sourceName: 'RPG World Builder curated historical fixture',
    license: 'original',
    methodology: 'curated',
    notes:
      'Small original test pool inspired by public-domain naming patterns — not production data.',
  },
  conventionCuration: {
    sourceName: 'RPG World Builder naming convention registry',
    license: 'original',
    methodology: 'curated',
  },
} as const satisfies Record<string, NameCollectionProvenance>
