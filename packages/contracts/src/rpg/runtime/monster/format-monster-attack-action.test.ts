import { describe, expect, it } from 'vitest'

import { formatMonsterAttackAction } from './format-monster-attack-action'
import type { DerivedMonsterAttackLine } from './stat-block'

function line(overrides: Partial<DerivedMonsterAttackLine>): DerivedMonsterAttackLine {
  return {
    id: 'attack',
    section: 'actions',
    name: 'Attack',
    attackBonus: 5,
    attackBonusLabel: '+5',
    damage: '6',
    damageExpression: '1d6+3',
    damageTypeId: 'piercing',
    modes: ['melee'],
    reach: 5,
    ...overrides,
  }
}

describe('formatMonsterAttackAction', () => {
  it('formats a melee attack', () => {
    expect(formatMonsterAttackAction(line({}))).toBe(
      'Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) Piercing damage.',
    )
  })

  it('formats a ranged attack with a long range', () => {
    expect(
      formatMonsterAttackAction(
        line({
          modes: ['ranged'],
          reach: undefined,
          range: { normal: 80, long: 320 },
        }),
      ),
    ).toBe('Ranged Attack Roll: +5, range 80/320 ft. Hit: 6 (1d6 + 3) Piercing damage.')
  })

  it('formats both modes with one bonus and a single range', () => {
    expect(
      formatMonsterAttackAction(
        line({
          attackBonus: 6,
          attackBonusLabel: '+6',
          damage: '16',
          damageExpression: '3d8+3',
          damageTypeId: 'force',
          modes: ['melee', 'ranged'],
          reach: 5,
          range: { normal: 120 },
        }),
      ),
    ).toBe(
      'Melee or Ranged Attack Roll: +6, reach 5 ft. or range 120 ft. Hit: 16 (3d8 + 3) Force damage.',
    )
  })

  it('joins on-hit damage and spaces a negative modifier', () => {
    expect(
      formatMonsterAttackAction(
        line({
          damage: '7',
          damageExpression: '1d8+3',
          additionalDamage: [{ average: 3, expression: '1d6-1', damageTypeId: 'fire' }],
        }),
      ),
    ).toBe(
      'Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Piercing damage plus 3 (1d6 - 1) Fire damage.',
    )
  })

  it('prints flat damage without dice and omits an empty hit clause', () => {
    expect(
      formatMonsterAttackAction(
        line({ damage: '5', damageExpression: '5', damageTypeId: 'bludgeoning' }),
      ),
    ).toBe('Melee Attack Roll: +5, reach 5 ft. Hit: 5 Bludgeoning damage.')
    expect(
      formatMonsterAttackAction(line({ damage: '0', damageExpression: undefined, modes: [] })),
    ).toBeUndefined()
  })
})
