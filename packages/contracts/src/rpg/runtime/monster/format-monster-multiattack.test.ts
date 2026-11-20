import { describe, expect, it } from 'vitest'

import type { MonsterAction } from '../../content/monster/action/index'

import {
  formatMonsterMultiattack,
  formatMonsterMultiattackResult,
} from './format-monster-multiattack'

const emptyEquipmentCatalog = new Map() as never

function formatSentence(input: {
  name: string
  multiattack: Extract<MonsterAction, { kind: 'multiattack' }>
  actions: MonsterAction[]
}): string {
  return formatMonsterMultiattack({
    monsterName: input.name,
    action: input.multiattack,
    actions: input.actions,
    equipment: [],
    equipmentCatalog: emptyEquipmentCatalog,
  })
}

describe('formatMonsterMultiattack', () => {
  it('joins several single-attack groups in one sentence', () => {
    const actions = [
      { id: 'claws', kind: 'natural-weapon', name: 'Claws' },
      { id: 'tail', kind: 'natural-weapon', name: 'Tail' },
      {
        id: 'multiattack',
        kind: 'multiattack',
        name: 'Multiattack',
        steps: [
          { count: 1, actionIds: ['claws'] },
          { count: 1, actionIds: ['tail'] },
        ],
      },
    ] as MonsterAction[]
    expect(
      formatSentence({ name: 'Barbed Devil', multiattack: actions[2] as never, actions }),
    ).toBe('The barbed devil makes one Claws attack and one Tail attack.')
  })

  it('returns unavailable when a referenced id is missing', () => {
    const actions = [
      {
        id: 'multiattack',
        kind: 'multiattack',
        name: 'Multiattack',
        steps: [
          { count: 1, actionIds: ['bite'] },
          { count: 1, actionIds: ['missing'] },
        ],
      },
    ] as MonsterAction[]
    expect(
      formatMonsterMultiattackResult({
        monsterName: 'Wolf',
        action: actions[0] as never,
        actions,
        equipment: [],
        equipmentCatalog: emptyEquipmentCatalog,
      }).status,
    ).toBe('unavailable')
  })

  it('prints replacement attack choices', () => {
    const actions = [
      { id: 'beak', kind: 'natural-weapon', name: 'Beak' },
      { id: 'talons', kind: 'natural-weapon', name: 'Talons' },
      {
        id: 'multiattack',
        kind: 'multiattack',
        name: 'Multiattack',
        steps: [{ count: 2, actionIds: ['beak'] }],
        replacement: { count: 1, choices: [{ actionId: 'talons' }] },
      },
    ] as MonsterAction[]
    expect(formatSentence({ name: 'Roc', multiattack: actions[2] as never, actions })).toBe(
      'The roc makes two Beak attacks. It can replace one attack with a Talons attack.',
    )
  })
})
