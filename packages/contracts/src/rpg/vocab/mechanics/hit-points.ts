import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Hit Points — SRD proper noun for generated effect prose (not a closed enum).
// ---------------------------------------------------------------------------

export const HIT_POINTS_TERM = {
  label: 'Hit Points',
  description:
    "A creature's health pool; damage reduces current hit points and healing restores them.",
  sentence: {
    singular: 'hit point',
    plural: 'hit points',
  },
} as const satisfies VocabularyTerm
