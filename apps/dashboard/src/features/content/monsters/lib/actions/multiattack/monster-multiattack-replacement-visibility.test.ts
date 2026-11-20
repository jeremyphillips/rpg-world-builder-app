import { describe, expect, it } from 'vitest'

import {
  multiattackAnyAttackWordingVisible,
  multiattackShowsStaticReplacementCount,
  multiattackTargetAttackFieldVisible,
} from './monster-multiattack-replacement-visibility'

const lichStep = {
  count: 3,
  actionIds: ['eldritch-burst', 'paralyzing-touch'],
}

describe('multiattack replacement visibility (watched keys match FormItems at actions.0)', () => {
  it('shows stepper and target affordances for Lich-like combo when steps is watched as `steps`', () => {
    const watched = {
      'replacement.count': 1,
      steps: [lichStep],
    }

    expect(multiattackShowsStaticReplacementCount(watched)).toBe(false)
    expect(multiattackTargetAttackFieldVisible(watched)).toBe(true)
    expect(multiattackAnyAttackWordingVisible(watched)).toBe(true)
  })

  it('does not treat a parent-relative steps key as primary sequence', () => {
    const watched = {
      'replacement.count': 1,
      '../steps': [lichStep],
    }

    expect(multiattackTargetAttackFieldVisible(watched)).toBe(false)
    expect(multiattackAnyAttackWordingVisible(watched)).toBe(false)
  })

  it('shows static count copy only for a single primary attack slot', () => {
    const watched = {
      'replacement.count': 1,
      steps: [{ count: 1, actionIds: ['bite'] }],
    }

    expect(multiattackShowsStaticReplacementCount(watched)).toBe(true)
  })
})
