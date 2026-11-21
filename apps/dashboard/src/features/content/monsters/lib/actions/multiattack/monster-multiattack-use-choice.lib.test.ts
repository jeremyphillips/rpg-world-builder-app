import { describe, expect, it } from 'vitest'

import {
  multiattackExpandUseToChoicePayload,
  multiattackUseChoiceAcquisitionVisible,
  multiattackUseChoiceRemovePlan,
} from './monster-multiattack-use-choice.lib'

describe('multiattackUseChoiceAcquisitionVisible', () => {
  it('hides optional steps and non-one repetition', () => {
    expect(multiattackUseChoiceAcquisitionVisible({ optional: true })).toBe(false)
    expect(multiattackUseChoiceAcquisitionVisible({ count: 2 })).toBe(false)
    expect(multiattackUseChoiceAcquisitionVisible({ count: '0' })).toBe(false)
  })

  it('shows compatible single steps including stored count one', () => {
    expect(multiattackUseChoiceAcquisitionVisible({ actionId: 'bite', count: 1 })).toBe(true)
    expect(multiattackUseChoiceAcquisitionVisible({ actionId: 'bite' })).toBe(true)
  })
})

describe('multiattackExpandUseToChoicePayload', () => {
  it('copies action and spell without count', () => {
    expect(
      multiattackExpandUseToChoicePayload({
        kind: 'use',
        mode: 'single',
        actionId: 'spellcasting',
        spellId: 'guiding-bolt',
        count: 1,
      }),
    ).toEqual({
      kind: 'use',
      mode: 'choice',
      choices: [{ actionId: 'spellcasting', spellId: 'guiding-bolt' }, {}],
    })
  })
})

describe('multiattackUseChoiceRemovePlan', () => {
  it('filters three or more choices', () => {
    const plan = multiattackUseChoiceRemovePlan(
      {
        mode: 'choice',
        choices: [{ actionId: 'a' }, { actionId: 'b' }, { actionId: 'c' }],
      },
      1,
    )
    expect(plan).toEqual({
      mode: 'filter',
      choices: [{ actionId: 'a' }, { actionId: 'c' }],
    })
  })

  it('collapses two choices to single and restores inherited count', () => {
    const plan = multiattackUseChoiceRemovePlan(
      {
        mode: 'choice',
        count: 2,
        choices: [{ actionId: 'a', spellId: 'x' }, { actionId: 'b' }],
      },
      0,
    )
    expect(plan).toEqual({
      mode: 'replaceParent',
      parent: { kind: 'use', mode: 'single', actionId: 'b', count: 2 },
    })
  })

  it('returns an incomplete single step when the final choice is removed', () => {
    const plan = multiattackUseChoiceRemovePlan({ mode: 'choice', choices: [{ actionId: 'a' }] }, 0)
    expect(plan).toEqual({
      mode: 'replaceParent',
      parent: { kind: 'use', mode: 'single', actionId: '' },
    })
  })
})
