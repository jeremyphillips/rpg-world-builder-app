import { describe, expect, it } from 'vitest'

import { MONSTER_ACTION_ATTACK_KINDS } from '../../../runtime/monster/resolve-monster-action-attack-profile'
import { multiattackEligibilityKinds } from './multiattack-eligibility'

/**
 * Attack-roll resolution (`MONSTER_ACTION_ATTACK_KINDS`) and multiattack
 * executable-attack selection (`executable-attack` purpose) currently share the
 * same three kinds. Multiattack may exclude additional kinds at row eligibility
 * time — do not assume every future attack-roll kind is multiattack-selectable.
 */
describe('multiattack executable-attack vs attack-roll kinds', () => {
  it('keeps executable-attack membership aligned with MONSTER_ACTION_ATTACK_KINDS', () => {
    const executable = [...multiattackEligibilityKinds('executable-attack')].sort()
    const attackRoll = [...MONSTER_ACTION_ATTACK_KINDS].sort()
    expect(executable).toEqual(attackRoll)
  })
})
