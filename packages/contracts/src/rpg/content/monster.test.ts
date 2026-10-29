import { describe, expect, it } from 'vitest'

import {
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  monsterActionDraftSchema,
  monsterActionSchema,
  monsterReactionSchema,
} from './monster'

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
    armorClass: {},
    hitPoints: { kind: 'hit-dice', count: 1 },
    movement: { walk: 30 },
    senses: [],
    communication: {},
    challengeRating: '0',
    proficiencies: { savingThrows: [], skills: [], languages: [], weapons: [] },
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

  it('rejects legacy communication.languages on create input', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'legacy-languages',
        ...baseBody,
        communication: { languages: { entries: [{ language: 'common' }] } },
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

  it('rejects duplicate trait ids on publish and draft', () => {
    const traits = [
      { id: 'pack', name: 'Pack', description: '<p>A</p>' },
      { id: 'pack', name: 'Pack again', description: '<p>B</p>' },
    ]
    expect(
      createMonsterInputSchema.safeParse({ slug: 'dup-traits', ...baseBody, traits }).success,
    ).toBe(false)
    expect(
      createMonsterDraftInputSchema.safeParse({ slug: 'dup-traits', ...baseBody, traits }).success,
    ).toBe(false)
  })

  it('rejects overlapping damage defenses on publish and allows them on a draft', () => {
    const defenses = {
      vulnerabilities: [],
      resistances: ['fire'],
      immunities: ['fire', 'poison'],
      conditionImmunities: ['poisoned'],
    }
    const published = createMonsterInputSchema.safeParse({
      slug: 'overlap',
      ...baseBody,
      defenses,
    })
    expect(published.success).toBe(false)
    if (!published.success) {
      expect(
        published.error.issues.some((issue) =>
          issue.message.includes('Fire is already a resistance'),
        ),
      ).toBe(true)
    }
    expect(
      createMonsterDraftInputSchema.safeParse({ slug: 'overlap', ...baseBody, defenses }).success,
    ).toBe(true)
  })
})

describe('monsterActionDraftSchema', () => {
  it('keeps partial damage dice that publish rejects', () => {
    const partial = {
      id: 'claw',
      kind: 'natural-weapon',
      name: 'Claw',
      damage: { dice: { count: 1 } },
    }
    expect(monsterActionDraftSchema.safeParse(partial).success).toBe(true)
    expect(monsterActionSchema.safeParse(partial).success).toBe(false)
  })
})
