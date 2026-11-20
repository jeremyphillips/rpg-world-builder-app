import { describe, expect, it } from 'vitest'

import {
  multiattackExpandUseToChoicePayload,
  multiattackUseChoiceExpandBlocked,
  multiattackUseChoiceRemovePlan,
} from './monster-multiattack-use-choice.lib'

describe('multiattackUseChoiceExpandBlocked', () => {
  it('blocks optional steps and non-one repetition', () => {
    expect(multiattackUseChoiceExpandBlocked({ optional: true }).disabled).toBe(true)
    expect(multiattackUseChoiceExpandBlocked({ count: 2 }).disabled).toBe(true)
    expect(multiattackUseChoiceExpandBlocked({ count: '0' }).disabled).toBe(true)
  })

  it('allows compatible single steps including stored count one', () => {
    expect(multiattackUseChoiceExpandBlocked({ actionId: 'bite', count: 1 }).disabled).toBe(false)
    expect(multiattackUseChoiceExpandBlocked({ actionId: 'bite' }).disabled).toBe(false)
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
