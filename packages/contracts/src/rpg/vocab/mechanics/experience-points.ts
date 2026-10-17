import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Experience Points — progression and reward mechanic (not monster-only).
// ---------------------------------------------------------------------------

export const EXPERIENCE_POINTS_TERM = {
  label: 'Experience Points',
  compactLabel: 'XP',
  description:
    'Points earned from overcoming challenges; characters spend them to advance in level.',
  sentence: {
    singular: 'experience point',
    plural: 'experience points',
  },
} as const satisfies VocabularyTerm
