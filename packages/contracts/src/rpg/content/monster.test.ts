import { describe, expect, it } from 'vitest'

import { createMonsterInputSchema, monsterActionSchema, monsterReactionSchema } from './monster'

describe('monsterActionSchema', () => {
  it('allows weapon actions without a name', () => {
    expect(
      monsterActionSchema.parse({
        id: 'dagger',
        kind: 'weapon',
        equipmentEntryId: 'dagger',
      }).name,
    ).toBeUndefined()
  })

  it('requires a name for natural-weapon actions', () => {
    expect(
      monsterActionSchema.safeParse({
        id: 'claw',
        kind: 'natural-weapon',
        mode: 'melee',
        properties: [],
        damage: { dice: { count: 1, faces: 4 } },
        damageType: 'slashing',
      }).success,
    ).toBe(false)
  })

  it('parses reaction triggers on reactions only', () => {
    expect(
      monsterReactionSchema.parse({
        id: 'parry',
        kind: 'special',
        name: 'Parry',
        description: '<p>Adds 2 to AC.</p>',
        trigger: 'When hit',
      }).trigger,
    ).toBe('When hit')
  })
})

describe('monsterBodySchema refinements', () => {
  const baseBody = {
    name: 'Test',
    size: 'medium',
    creatureType: 'humanoid',
    alignment: 'n',
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    armorClass: { kind: 'unarmored' },
    hitPoints: { kind: 'hit-dice', count: 1 },
    movement: { walk: 30 },
    senses: [],
    languages: { entries: [] },
    challengeRating: '0',
    proficiencies: { savingThrows: [], skills: [], weapons: [] },
    defenses: {
      vulnerabilities: [],
      resistances: [],
      immunities: [],
      conditionImmunities: [],
    },
  } as const

  it('rejects duplicate action ids across sections', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'dup-actions',
        ...baseBody,
        actions: [{ id: 'shared', kind: 'special', name: 'A', description: 'a' }],
        reactions: [{ id: 'shared', kind: 'special', name: 'B', description: 'b', trigger: 't' }],
      }).success,
    ).toBe(false)
  })

  it('allows CR 0 XP override only when different from derived', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'cr-zero-override',
        ...baseBody,
        experiencePointsOverride: 0,
      }).success,
    ).toBe(true)

    expect(
      createMonsterInputSchema.safeParse({
        slug: 'xp-override-blocked',
        ...baseBody,
        challengeRating: '1/8',
        experiencePointsOverride: 0,
      }).success,
    ).toBe(false)
  })
})
