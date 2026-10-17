import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Passive Perception — derived detection score (10 + Perception modifier).
// ---------------------------------------------------------------------------

export const PASSIVE_PERCEPTION_TERM = {
  label: 'Passive Perception',
  description: 'A creature’s Perception score without rolling: 10 plus its Perception modifier.',
  sentence: {
    singular: 'passive Perception',
    plural: 'passive Perception',
  },
} as const satisfies VocabularyTerm
