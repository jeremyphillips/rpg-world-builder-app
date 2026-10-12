import type { VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Saving Throw — d20 defense against spells, traps, and similar effects.
// ---------------------------------------------------------------------------

export const SAVING_THROW_TERM = {
  label: 'Saving Throw',
  description:
    'A d20 roll, usually adding an ability modifier and proficiency when applicable, to resist an effect.',
  sentence: {
    singular: 'saving throw',
    plural: 'saving throws',
  },
} as const satisfies VocabularyTerm

/** Short table/sheet label — not a compact abbreviation like HP or XP. */
export const SAVING_THROW_SHORT_LABEL = 'Save'

/** Section heading for multiple saves on a stat block or sheet. */
export function getSavingThrowsSectionLabel(): string {
  return `${SAVING_THROW_TERM.label}s`
}
