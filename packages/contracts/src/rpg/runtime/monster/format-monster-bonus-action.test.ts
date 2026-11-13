import { describe, expect, it } from 'vitest'

import {
  formatMonsterLeap,
  formatMonsterTakeActions,
  formatMonsterTeleport,
} from './format-monster-bonus-action'

describe('formatMonsterLeap', () => {
  it('prints the jump and the movement it spends', () => {
    expect(formatMonsterLeap({ monsterName: 'Hezrou', distanceFeet: 30, movementFeet: 10 })).toBe(
      'The hezrou jumps up to 30 feet by spending 10 feet of movement.',
    )
  })

  it('omits the sentence until both distances are positive whole feet', () => {
    expect(
      formatMonsterLeap({ monsterName: 'Hezrou', distanceFeet: undefined, movementFeet: 10 }),
    ).toBeUndefined()
    expect(
      formatMonsterLeap({ monsterName: 'Hezrou', distanceFeet: 30, movementFeet: undefined }),
    ).toBeUndefined()
    expect(formatMonsterLeap({ monsterName: 'Hezrou', distanceFeet: 0, movementFeet: 10 })).toBe(
      undefined,
    )
    expect(formatMonsterLeap({ monsterName: 'Hezrou', distanceFeet: 7.5, movementFeet: 10 })).toBe(
      undefined,
    )
    expect(formatMonsterLeap({ monsterName: 'Bulette', distanceFeet: 7, movementFeet: 200 })).toBe(
      'The bulette jumps up to 7 feet by spending 200 feet of movement.',
    )
  })
})

describe('formatMonsterTeleport', () => {
  it('prints a self teleport', () => {
    expect(formatMonsterTeleport({ monsterName: 'Blink Dog', distanceFeet: 40 })).toBe(
      'The blink dog teleports up to 40 feet to an unoccupied space it can see.',
    )
    expect(formatMonsterTeleport({ monsterName: 'Marilith', distanceFeet: 120 })).toBe(
      'The marilith teleports up to 120 feet to an unoccupied space it can see.',
    )
  })

  it('prints Balor when the other creature phrase and distance are set', () => {
    expect(
      formatMonsterTeleport({
        monsterName: 'Balor',
        distanceFeet: 60,
        passenger: { phrase: 'a willing demon', withinFeet: 10 },
      }),
    ).toBe(
      'The balor teleports itself or a willing demon within 10 feet of itself up to 60 feet to an unoccupied space the balor can see.',
    )
  })

  it('prints nothing while the other creature is incomplete', () => {
    expect(
      formatMonsterTeleport({
        monsterName: 'Balor',
        distanceFeet: 60,
        passenger: { withinFeet: 10 },
      }),
    ).toBeUndefined()
    expect(
      formatMonsterTeleport({
        monsterName: 'Balor',
        distanceFeet: 60,
        passenger: { phrase: 'a willing demon' },
      }),
    ).toBeUndefined()
    expect(formatMonsterTeleport({ monsterName: 'Blink Dog', distanceFeet: undefined })).toBe(
      undefined,
    )
  })
})

describe('formatMonsterTakeActions', () => {
  it('prints one, or, and and', () => {
    expect(
      formatMonsterTakeActions({
        monsterName: 'Shadow',
        standardActions: ['hide'],
        restriction: 'While in Dim Light or darkness',
      }),
    ).toBe('While in Dim Light or darkness, the shadow takes the Hide action.')
    expect(
      formatMonsterTakeActions({
        monsterName: 'Goblin',
        standardActions: ['hide', 'disengage'],
        combination: 'one',
      }),
    ).toBe('The goblin takes the Disengage or Hide action.')
    expect(
      formatMonsterTakeActions({
        monsterName: 'Assassin',
        standardActions: ['hide', 'dash', 'disengage'],
        combination: 'one',
      }),
    ).toBe('The assassin takes the Dash, Disengage, or Hide action.')
    expect(
      formatMonsterTakeActions({
        monsterName: 'Clay Golem',
        standardActions: ['disengage', 'dash'],
        combination: 'each',
      }),
    ).toBe('The clay golem takes the Dash and Disengage actions.')
    expect(
      formatMonsterTakeActions({
        monsterName: 'Creature',
        standardActions: ['hide', 'dash', 'disengage'],
        combination: 'each',
      }),
    ).toBe('The creature takes the Dash, Disengage, and Hide actions.')
  })

  it('drops one trailing period on the restriction and ignores choice for one action', () => {
    expect(
      formatMonsterTakeActions({
        monsterName: 'Shadow',
        standardActions: ['hide'],
        combination: 'each',
        restriction: 'While in Dim Light or darkness.',
      }),
    ).toBe('While in Dim Light or darkness, the shadow takes the Hide action.')
  })

  it('prints nothing until a choice exists for two actions', () => {
    expect(
      formatMonsterTakeActions({
        monsterName: 'Assassin',
        standardActions: ['dash', 'disengage'],
      }),
    ).toBeUndefined()
    expect(
      formatMonsterTakeActions({ monsterName: 'Assassin', standardActions: [] }),
    ).toBeUndefined()
  })
})
