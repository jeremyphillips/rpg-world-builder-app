import { describe, expect, it } from 'vitest'

import {
  classifyMultiattackReplacementChoice,
  multiattackReplacementChoiceKey,
  siblingMultiattackReplacementChoiceKeys,
} from './multiattack-replacement-choice-eligibility'

describe('multiattack replacement choice eligibility', () => {
  const werebearSteps = [{ count: 2, actionIds: ['handaxe', 'rend'] }]
  const hellHoundSteps = [{ count: 2, actionIds: ['bite'] }]
  const chimeraSteps = [
    { count: 1, actionIds: ['ram'] },
    { count: 1, actionIds: ['bite'] },
    { count: 1, actionIds: ['claw'] },
  ]
  const lichSteps = [{ count: 3, actionIds: ['eldritch-burst', 'paralyzing-touch'] }]

  it('allows off-sequence attack choices (Werebear Bite)', () => {
    expect(
      classifyMultiattackReplacementChoice({
        steps: werebearSteps,
        replacement: {},
        choice: { actionId: 'bite' },
      }),
    ).toBe('ok')
  })

  it('rejects unrestricted choices already in the attack sequence', () => {
    expect(
      classifyMultiattackReplacementChoice({
        steps: hellHoundSteps,
        replacement: {},
        choice: { actionId: 'bite' },
      }),
    ).toBe('already_in_sequence')
  })

  it('rejects self-targeted replacement', () => {
    expect(
      classifyMultiattackReplacementChoice({
        steps: lichSteps,
        replacement: { replacesActionId: 'eldritch-burst' },
        choice: { actionId: 'eldritch-burst' },
      }),
    ).toBe('self_target')
  })

  it('allows other sequence members when a different attack is targeted (Chimera)', () => {
    expect(
      classifyMultiattackReplacementChoice({
        steps: chimeraSteps,
        replacement: { replacesActionId: 'claw' },
        choice: { actionId: 'fire-breath' },
      }),
    ).toBe('ok')
    expect(
      classifyMultiattackReplacementChoice({
        steps: chimeraSteps,
        replacement: { replacesActionId: 'claw' },
        choice: { actionId: 'bite' },
      }),
    ).toBe('ok')
  })

  it('tracks sibling choice keys for duplicate picker filtering', () => {
    expect(multiattackReplacementChoiceKey({ actionId: 'spell', spellId: 'a' })).toBe('spell:a')
    const taken = siblingMultiattackReplacementChoiceKeys(
      [{ actionId: 'fire-breath' }, { actionId: 'bite' }],
      { actionId: 'bite' },
    )
    expect(taken).toEqual(new Set(['fire-breath:']))
  })
})
