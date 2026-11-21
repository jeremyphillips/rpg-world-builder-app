import type { VocabularyTerm } from '../types'

export const LAIR_TERM = {
  label: 'Lair',
  description:
    'A place where a creature dwells. Some creatures gain additional abilities or benefits while in their lairs.',
  sentence: { singular: 'lair', plural: 'lairs' },
} as const satisfies VocabularyTerm
