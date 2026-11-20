import { describe, expect, it } from 'vitest'

import { multiattackUseStepShouldClearRepetitionOnActionChange } from './monster-multiattack-use-action-transition.lib'

describe('multiattackUseStepShouldClearRepetitionOnActionChange', () => {
  it('clears only when action changes to a known spell with repetition', () => {
    expect(
      multiattackUseStepShouldClearRepetitionOnActionChange({
        previousActionId: 'bite',
        nextActionId: 'spellcasting',
        nextActionKind: 'spell',
        count: 2,
      }),
    ).toBe(true)
  })

  it('does not clear without repetition', () => {
    expect(
      multiattackUseStepShouldClearRepetitionOnActionChange({
        previousActionId: 'bite',
        nextActionId: 'spellcasting',
        nextActionKind: 'spell',
        count: undefined,
      }),
    ).toBe(false)
  })

  it('does not clear when action id is unchanged', () => {
    expect(
      multiattackUseStepShouldClearRepetitionOnActionChange({
        previousActionId: 'spellcasting',
        nextActionId: 'spellcasting',
        nextActionKind: 'spell',
        count: 2,
      }),
    ).toBe(false)
  })

  it('does not clear for unresolved action kinds', () => {
    expect(
      multiattackUseStepShouldClearRepetitionOnActionChange({
        previousActionId: 'bite',
        nextActionId: 'missing-action',
        nextActionKind: undefined,
        count: 2,
      }),
    ).toBe(false)
  })

  it('preserves repetition across eligible action swaps', () => {
    expect(
      multiattackUseStepShouldClearRepetitionOnActionChange({
        previousActionId: 'bite',
        nextActionId: 'claw',
        nextActionKind: 'natural-weapon',
        count: 2,
      }),
    ).toBe(false)
  })
})
