import { describe, expect, it } from 'vitest'

import {
  formatConditionReplacementSentence,
  formatOrderedOutcomeEffects,
  formatRepeatSaveTransition,
} from './format-ordered-outcome-effects'

describe('formatConditionReplacementSentence', () => {
  it('formats restrained-to-petrified swap copy', () => {
    expect(
      formatConditionReplacementSentence({
        conditionId: 'petrified',
        replacesConditionId: 'restrained',
      }),
    ).toBe('The target has the Petrified condition instead of the Restrained condition.')
  })
})

describe('formatOrderedOutcomeEffects', () => {
  it('formats condition rows with effect end and replacement', () => {
    const clauses = formatOrderedOutcomeEffects([
      {
        kind: 'condition',
        conditionId: 'unconscious',
        end: { kind: 'turn-bound', participant: 'target', boundary: 'end', which: 'next' },
      },
      {
        kind: 'condition',
        conditionId: 'petrified',
        replacesConditionId: 'restrained',
      },
      { kind: 'note', description: 'A shaken target wakes.' },
    ])
    expect(clauses[0]).toContain('Unconscious')
    expect(clauses[0]).toContain("until the end of the target's next turn")
    expect(clauses[1]).toBe(
      'The target has the Petrified condition instead of the Restrained condition.',
    )
    expect(clauses[2]).toBe('A shaken target wakes.')
  })
})

describe('formatRepeatSaveTransition', () => {
  it('emits end-of-next-turn repeat copy', () => {
    expect(
      formatRepeatSaveTransition({
        participant: 'target',
        boundary: 'end',
        which: 'next',
      }),
    ).toBe('At the end of its next turn, it repeats the saving throw.')
  })
})
