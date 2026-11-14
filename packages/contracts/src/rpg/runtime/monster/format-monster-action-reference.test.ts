import { describe, expect, it } from 'vitest'

import type { MonsterAction } from '../../content/monster'
import { formatMonsterActionReference } from './format-monster-multiattack'
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

function special(id: string, name: string): MonsterAction {
  return {
    id,
    kind: 'special',
    name,
    description: '<p>Rules.</p>',
  }
}

describe('formatMonsterActionReference', () => {
  const actions = [
    natural('rend', 'Rend'),
    natural('claw', 'Claw'),
    natural('tail', 'Tail'),
    natural('bite', 'Bite'),
    natural('horn', 'Radiant Horn'),
    special('glare', 'Dreadful Glare'),
    special('lightning', 'Lightning Strike'),
  ]

  it('prints one attack, a choice of attacks, and movement', () => {
    expect(
      formatMonsterActionReference({
        monsterName: 'Ancient Red Dragon',
        action: {
          id: 'tail-swipe',
          kind: 'action-reference',
          name: 'Tail Swipe',
          actionIds: ['rend'],
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The ancient red dragon makes one Rend attack.')

    expect(
      formatMonsterActionReference({
        monsterName: 'Ancient Red Dragon',
        action: {
          id: 'pounce',
          kind: 'action-reference',
          name: 'Pounce',
          actionIds: ['rend'],
          movement: { allowance: 'half-speed' },
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The ancient red dragon moves up to half its Speed, and it makes one Rend attack.')

    expect(
      formatMonsterActionReference({
        monsterName: 'Ancient Red Dragon',
        action: {
          id: 'onslaught',
          kind: 'action-reference',
          name: 'Onslaught',
          actionIds: ['claw', 'tail'],
          movement: { allowance: 'half-speed' },
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe(
      'The ancient red dragon moves up to half its Speed, and it makes one Claw or Tail attack.',
    )

    expect(
      formatMonsterActionReference({
        monsterName: 'Unicorn',
        action: {
          id: 'charge',
          kind: 'action-reference',
          name: 'Charging Horn',
          actionIds: ['horn'],
          movement: { allowance: 'half-speed', withoutOpportunityAttacks: true },
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe(
      'The unicorn moves up to half its Speed without provoking Opportunity Attacks, and it makes one Radiant Horn attack.',
    )

    expect(
      formatMonsterActionReference({
        monsterName: 'Vampire',
        action: {
          id: 'necrotic',
          kind: 'action-reference',
          name: 'Necrotic Strike',
          actionIds: ['bite', 'claw'],
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The vampire makes one Bite or Claw attack.')

    expect(
      formatMonsterActionReference({
        monsterName: 'Ancient Red Dragon',
        action: {
          id: 'choice',
          kind: 'action-reference',
          name: 'Choice',
          actionIds: ['bite', 'claw', 'tail'],
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The ancient red dragon makes one Bite, Claw, or Tail attack.')

    expect(
      formatMonsterActionReference({
        monsterName: 'Ancient Red Dragon',
        action: {
          id: 'charge-full',
          kind: 'action-reference',
          name: 'Charge',
          actionIds: ['rend'],
          movement: { allowance: 'speed' },
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The ancient red dragon moves up to its Speed, and it makes one Rend attack.')
  })

  it('prints an ability reference and keeps the turn limit as its own sentence', () => {
    expect(
      formatMonsterActionReference({
        monsterName: 'Mummy Lord',
        action: {
          id: 'glare',
          kind: 'action-reference',
          name: 'Glare',
          actionIds: ['glare'],
          onceUntilNextTurn: true,
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The mummy lord uses Dreadful Glare.')
    expect(formatOnceUntilNextTurnSentence({ monsterName: 'Mummy Lord', kind: 'special' })).toBe(
      "The mummy lord can't take this action again until the start of its next turn.",
    )

    expect(
      formatMonsterActionReference({
        monsterName: 'Adult Blue Dragon',
        action: {
          id: 'storm',
          kind: 'action-reference',
          name: 'Storm Bolt',
          actionIds: ['lightning'],
        },
        actions,
        equipment,
        equipmentCatalog: catalog,
      }),
    ).toBe('The adult blue dragon uses Lightning Strike.')
  })

  it('uses the current action name for a stable id', () => {
    expect(
      formatMonsterActionReference({
        monsterName: 'Ancient Red Dragon',
        action: {
          id: 'pounce',
          kind: 'action-reference',
          name: 'Pounce',
          actionIds: ['rend'],
          movement: { allowance: 'half-speed' },
        },
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
