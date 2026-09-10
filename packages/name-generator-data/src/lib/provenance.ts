import type { NameCollectionProvenance } from '@rpg/contracts/name-generator'

export const FIXTURE_COLLECTION_PROVENANCE = {
  fictionalOriginal: {
    sourceName: 'RPG World Builder original fixture',
    license: 'original',
    methodology: 'original-fictional',
  },
  historicalCurated: {
    sourceName: 'RPG World Builder curated historical pool',
    license: 'original',
    methodology: 'curated',
    notes:
      'Curated from widely documented real-world naming traditions using common English orthography. Sized to what is genuinely attested rather than padded to match fictional pools.',
  },
  conventionCuration: {
    sourceName: 'RPG World Builder naming convention registry',
    license: 'original',
    methodology: 'curated',
  },
  patternDerived: {
    sourceName: 'RPG World Builder pattern-derived pool',
    license: 'original',
    methodology: 'pattern-derived',
    notes:
      'Generated from documented morphemes rather than padded attested lists. See each collection description for the morpheme source.',
  },
} as const satisfies Record<string, NameCollectionProvenance>
