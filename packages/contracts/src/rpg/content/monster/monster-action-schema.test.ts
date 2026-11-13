import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  createMonsterInputSchema,
  monsterActionDraftSchema,
  monsterActionSchema,
  monsterReactionDraftSchema,
  monsterReactionSchema,
  type MonsterReaction,
} from '../monster'
import { MONSTER_TEST_INPUT } from './test-fixtures'

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

  it('keeps a partial weapon damage override on drafts and rejects it when published', () => {
    const partial = {
      id: 'shot',
      kind: 'weapon' as const,
      equipmentEntryId: 'bow',
      damage: { dice: { count: 2 } },
    }
    expect(monsterActionDraftSchema.parse(partial)).toMatchObject({
      damage: { dice: { count: 2 } },
    })
    expect(monsterActionDraftSchema.parse({ ...partial, damage: {} })).toMatchObject({
      damage: {},
    })
    expect(monsterActionSchema.safeParse(partial).success).toBe(false)
    expect(
      monsterActionSchema.safeParse({
        ...partial,
        damage: { dice: { count: 2, faces: 6 } },
      }).success,
    ).toBe(true)
  })

  it('requires a name for natural weapons that have no preset', () => {
    const natural = {
      id: 'claw',
      kind: 'natural-weapon' as const,
      mode: 'melee' as const,
      properties: [],
      damage: { dice: { count: 1, faces: 4 } },
      damageType: 'slashing',
    }
    expect(monsterActionSchema.safeParse(natural).success).toBe(true)
    const published = createMonsterInputSchema.safeParse({
      ...MONSTER_TEST_INPUT,
      actions: [natural],
    })
    expect(published.success).toBe(false)
    expect(published.error?.issues.some((issue) => issue.message === 'Name is required.')).toBe(
      true,
    )
    expect(
      createMonsterInputSchema.safeParse({
        ...MONSTER_TEST_INPUT,
        actions: [{ ...natural, preset: 'claw' }],
      }).success,
    ).toBe(true)
  })

  it('stores a parry bonus without a trigger and requires it when published', () => {
    expect(
      monsterReactionDraftSchema.parse({
        id: 'parry',
        kind: 'parry',
        name: 'Parry',
        acBonus: 2,
      }),
    ).not.toHaveProperty('trigger')
    expect(
      monsterReactionSchema.safeParse({ id: 'parry', kind: 'parry', name: 'Parry' }).success,
    ).toBe(false)
    expect(
      monsterReactionSchema.safeParse({
        id: 'parry',
        kind: 'parry',
        name: 'Parry',
        acBonus: 11,
      }).success,
    ).toBe(false)
    expect(
      monsterReactionSchema.safeParse({ id: 'parry', kind: 'weapon', equipmentEntryId: 'sword' })
        .success,
    ).toBe(false)
  })

  it('parses reaction triggers on reactions only', () => {
    const reaction = monsterReactionSchema.parse({
      id: 'parry',
      kind: 'special',
      name: 'Parry',
      description: '<p>Adds 2 to AC.</p>',
      trigger: { text: 'When hit' },
    })
    expect(reaction.kind === 'special' ? reaction.trigger : undefined).toEqual({ text: 'When hit' })
  })

  it('keeps special reaction rules text optional when a saving throw can stand alone', () => {
    expectTypeOf<Extract<MonsterReaction, { kind: 'special' }>['description']>().toEqualTypeOf<
      string | undefined
    >()
  })

  it('keeps partial limited use on drafts and accepts published values', () => {
    const partial = {
      id: 'breath',
      kind: 'special' as const,
      limitedUse: { kind: 'recharge' as const },
    }
    expect(monsterActionDraftSchema.safeParse(partial).success).toBe(true)
    expect(monsterActionSchema.safeParse(partial).success).toBe(false)
    const published = monsterActionSchema.parse({
      id: 'breath',
      kind: 'special',
      name: 'Breath',
      description: '<p>Exhales.</p>',
      limitedUse: { kind: 'recharge', minRoll: 5 },
    })
    expect(monsterActionDraftSchema.parse(published)).toMatchObject(published)
  })

  it('requires published attack damage and allows drafts to omit it', () => {
    const attack = {
      id: 'slash',
      kind: 'attack' as const,
      name: 'Slash',
      bonusSource: { kind: 'ability' as const, ability: 'str' as const, proficient: true },
      modes: ['melee' as const],
      damage: { dice: { count: 1, faces: 8 } },
      damageType: 'slashing',
    }
    expect(monsterActionSchema.safeParse(attack).success).toBe(true)
    const { damage: _damage, damageType: _damageType, ...withoutDamage } = attack
    expect(monsterActionSchema.safeParse(withoutDamage).success).toBe(false)
    expect(monsterActionDraftSchema.safeParse(withoutDamage).success).toBe(true)
  })

  it('uses the same keys for published and draft variants', () => {
    const keys = (schema: { options: readonly { shape: object }[] }) =>
      schema.options.map((option) => Object.keys(option.shape).sort())
    expect(keys(monsterActionDraftSchema)).toEqual(keys(monsterActionSchema))
    const reactionOptions = (schema: object) =>
      keys(schema as { options: readonly { shape: object }[] })
    expect(reactionOptions(monsterReactionDraftSchema)).toEqual(
      reactionOptions(monsterReactionSchema),
    )
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
