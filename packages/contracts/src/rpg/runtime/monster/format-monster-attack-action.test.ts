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
          onHit: [
            {
              kind: 'damage',
              source: 'action',
              average: 3,
              expression: '1d6-1',
              damageTypeId: 'fire',
            },
          ],
        }),
      ),
    ).toBe(
      'Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Piercing damage plus 3 (1d6 - 1) Fire damage.',
    )
  })

  it('prints a condition qualification and a note without changing the damage clause', () => {
    expect(
      formatMonsterAttackAction(
        line({
          attackBonus: 12,
          attackBonusLabel: '+12',
          damage: '15',
          damageExpression: '3d6+5',
          damageTypeId: 'cold',
          onHit: [
            {
              kind: 'condition',
              source: 'action',
              conditionId: 'paralyzed',
              description: "until the start of the lich's next turn",
            },
            { kind: 'note', source: 'action', description: 'The target starts burning' },
          ],
        }),
      ),
    ).toBe(
      "Melee Attack Roll: +12, reach 5 ft. Hit: 15 (3d6 + 5) Cold damage, and the target has the Paralyzed condition until the start of the lich's next turn. The target starts burning.",
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
