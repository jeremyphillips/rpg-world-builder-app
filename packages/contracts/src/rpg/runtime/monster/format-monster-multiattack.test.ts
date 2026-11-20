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

  it('returns unavailable when replacement is opened but choices are missing', () => {
    const actions = [
      { id: 'bite', kind: 'natural-weapon', name: 'Bite' },
      {
        id: 'multiattack',
        kind: 'multiattack',
        name: 'Multiattack',
        steps: [{ count: 2, actionIds: ['bite'] }],
        replacement: {
          choices: [],
          replacesActionId: 'bite',
        },
      },
    ] as MonsterAction[]
    expect(
      formatMonsterMultiattackResult({
        monsterName: 'Hell Hound',
        action: actions[1] as never,
        actions,
        equipment: [],
        equipmentCatalog: emptyEquipmentCatalog,
      }).status,
    ).toBe('unavailable')
  })

  it('appends if available when a replacement choice has limited use', () => {
    const actions = [
      { id: 'claw', kind: 'natural-weapon', name: 'Claw' },
      {
        id: 'breath',
        kind: 'save',
        name: 'Fire Breath',
        limitedUse: { kind: 'recharge', minRoll: 5 },
      },
      {
        id: 'multiattack',
        kind: 'multiattack',
        name: 'Multiattack',
        steps: [{ count: 1, actionIds: ['claw'] }],
        replacement: {
          count: 1,
          replacesActionId: 'claw',
          choices: [{ actionId: 'breath' }],
        },
      },
    ] as MonsterAction[]
    expect(formatSentence({ name: 'Chimera', multiattack: actions[2] as never, actions })).toBe(
      'The chimera makes one Claw attack. It can replace the Claw attack with a use of Fire Breath if available.',
    )
  })

  it('joins any-combination attacks with a single use clause', () => {
    const actions = [
      { id: 'eldritch-burst', kind: 'spell', name: 'Eldritch Burst', spells: [] },
      { id: 'paralyzing-touch', kind: 'natural-weapon', name: 'Paralyzing Touch' },
      { id: 'spellcasting', kind: 'spell', name: 'Spellcasting', spells: [] },
      {
        id: 'multiattack',
        kind: 'multiattack',
        name: 'Multiattack',
        steps: [
          { count: 3, actionIds: ['eldritch-burst', 'paralyzing-touch'] },
          { actionId: 'spellcasting', count: 1, actionIds: [] },
        ],
      },
    ] as MonsterAction[]
    expect(formatSentence({ name: 'Lich', multiattack: actions[3] as never, actions })).toBe(
      'The lich makes three attacks, using Eldritch Burst or Paralyzing Touch in any combination and uses Spellcasting.',
    )
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
