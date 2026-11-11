import { describe, expect, it } from 'vitest'

import type { MonsterAction } from '../../content/monster'
import { formatMonsterAttackSequence } from './format-monster-multiattack'
import {
  formatMonsterStatBlockSubject,
  formatOnceUntilNextTurnSentence,
} from './spell-entry-presentation'

const equipment = [] as const
const catalog = new Map()

function natural(id: string, name: string): MonsterAction {
  return {
    id,
    kind: 'natural-weapon',
    name,
    mode: 'melee',
    properties: [],
    damage: { dice: { count: 1, faces: 6 } },
    damageType: 'slashing',
  }
}

describe('formatMonsterAttackSequence', () => {
  const actions = [natural('rend', 'Rend'), natural('claw', 'Claw'), natural('tail', 'Tail')]

  it('prints one referenced attack, alternatives, and a predicate lead', () => {
    expect(
      formatMonsterAttackSequence({
        monsterName: 'Ancient Red Dragon',
        action: { steps: [{ count: 1, actionIds: ['rend'] }] },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The ancient red dragon makes one Rend attack.')

    expect(
      formatMonsterAttackSequence({
        monsterName: 'Tarrasque',
        action: {
          lead: 'moves up to half its Speed',
          steps: [{ count: 1, actionIds: ['claw', 'tail'] }],
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe(
      'The tarrasque moves up to half its Speed, and it makes one attack, using Claw or Tail in any combination.',
    )

    expect(
      formatMonsterAttackSequence({
        monsterName: 'Sphinx of Lore',
        action: {
          lead: 'can teleport up to 30 feet to an unoccupied space it can see.',
          steps: [{ count: 1, actionIds: ['claw'] }],
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe(
      'The sphinx of lore can teleport up to 30 feet to an unoccupied space it can see, and it makes one Claw attack.',
    )
  })

  it('uses the current action name for a stable id', () => {
    expect(
      formatMonsterAttackSequence({
        monsterName: 'Ancient Red Dragon',
        action: { lead: 'moves up to half its Speed,', steps: [{ count: 1, actionIds: ['rend'] }] },
        actions: [natural('rend', 'Rake')],
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The ancient red dragon moves up to half its Speed, and it makes one Rake attack.')
  })
})

describe('legendary stat-block sentences', () => {
  it('does not double an article and places the turn restriction once', () => {
    expect(formatMonsterStatBlockSubject('Lich')).toBe('the lich')
    expect(formatMonsterStatBlockSubject('Ancient Red Dragon')).toBe('the ancient red dragon')
    expect(formatMonsterStatBlockSubject('Tarrasque')).toBe('the tarrasque')
    expect(formatMonsterStatBlockSubject('The Lich')).toBe('the lich')

    expect(formatOnceUntilNextTurnSentence({ monsterName: 'Lich', kind: 'save' })).toBe(
      "Failure or Success: The lich can't take this action again until the start of its next turn.",
    )
    expect(formatOnceUntilNextTurnSentence({ monsterName: 'Lich', kind: 'spell' })).toBe(
      "The lich can't take this action again until the start of its next turn.",
    )
  })
})
