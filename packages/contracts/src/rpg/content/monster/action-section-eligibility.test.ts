import { describe, expect, it } from 'vitest'

import {
  monsterActionMoveDataLoss,
  monsterActionSectionMoveEligibility,
  monsterSectionAllowsKind,
} from './action-section-eligibility'

describe('monsterActionSectionMoveEligibility', () => {
  it('rejects legendary and primary spellcasting destinations', () => {
    expect(
      monsterActionSectionMoveEligibility({ kind: 'special' }, 'actions', 'legendaryActions'),
    ).toEqual({ allowed: false, reason: 'legendary' })
    expect(
      monsterActionSectionMoveEligibility(
        { kind: 'spell', profile: 'primary' },
        'actions',
        'bonusActions',
      ),
    ).toEqual({ allowed: false, reason: 'primary-spellcasting' })
  })

  it('allows compatible kind moves between standard sections', () => {
    expect(
      monsterActionSectionMoveEligibility({ kind: 'spell' }, 'bonusActions', 'actions'),
    ).toEqual({ allowed: true })
    expect(monsterSectionAllowsKind('reactions', 'parry')).toBe(true)
    expect(monsterSectionAllowsKind('legendaryActions', 'save')).toBe(true)
    expect(
      monsterActionSectionMoveEligibility({ kind: 'leap' }, 'bonusActions', 'actions'),
    ).toEqual({ allowed: false, reason: 'kind' })
    expect(
      monsterActionSectionMoveEligibility({ kind: 'teleport' }, 'bonusActions', 'actions'),
    ).toEqual({ allowed: true })
  })
})

describe('monsterActionMoveDataLoss', () => {
  it('marks reaction trigger prose for stripping when leaving reactions', () => {
    expect(
      monsterActionMoveDataLoss({ trigger: { text: 'When hit' } }, 'reactions', 'actions'),
    ).toEqual({ dropsTrigger: true })
    expect(monsterActionMoveDataLoss({ trigger: { text: ' ' } }, 'reactions', 'actions')).toEqual({
      dropsTrigger: false,
    })
    expect(
      monsterActionMoveDataLoss({ trigger: { text: 'When hit' } }, 'reactions', 'reactions'),
    ).toEqual({ dropsTrigger: false })
  })
})
