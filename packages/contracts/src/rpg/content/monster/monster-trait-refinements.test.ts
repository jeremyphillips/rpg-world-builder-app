import { describe, expect, it } from 'vitest'

import {
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  type CreateMonsterInput,
} from '../monster'
import { MONSTER_TEST_BODY } from './test-fixtures'

describe('monster trait refinements', () => {
  it('rejects a second copy of the same trait preset on publish and draft', () => {
    const traits = [
      { id: 'pack-1', preset: 'pack-tactics' as const },
      { id: 'pack-2', preset: 'pack-tactics' as const },
    ]
    expect(
      createMonsterInputSchema.safeParse({ slug: 'dup-preset', ...MONSTER_TEST_BODY, traits })
        .success,
    ).toBe(false)
    expect(
      createMonsterDraftInputSchema.safeParse({ slug: 'dup-preset', ...MONSTER_TEST_BODY, traits })
        .success,
    ).toBe(false)
  })

  it('publishes one regeneration preset', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'two-regeneration',
        ...MONSTER_TEST_BODY,
        traits: [
          { id: 'regen', preset: 'regeneration', hitPoints: 10 },
          {
            id: 'regen-2',
            preset: 'regeneration',
            hitPoints: 15,
            regeneratesAtZeroHp: true,
            interruptedByDamageTypes: ['acid', 'fire'],
          },
        ],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'regen-halt-id',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'halt', preset: 'regeneration-halt', hitPoints: 15 }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'regen-too-high',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'regen', preset: 'regeneration', hitPoints: 31 }],
      }).success,
    ).toBe(false)
    const troll = createMonsterInputSchema.safeParse({
      slug: 'troll',
      ...MONSTER_TEST_BODY,
      traits: [
        {
          id: 'regen',
          preset: 'regeneration',
          hitPoints: 15,
          regeneratesAtZeroHp: true,
          interruptedByDamageTypes: ['acid', 'fire'],
        },
      ],
    })
    expect(troll.success).toBe(true)
    if (troll.success) {
      const data = troll.data as CreateMonsterInput
      expect(data.traits[0]).toMatchObject({
        preset: 'regeneration',
        hitPoints: 15,
        regeneratesAtZeroHp: true,
        interruptedByDamageTypes: ['acid', 'fire'],
      })
    }
    const defaults = createMonsterInputSchema.safeParse({
      slug: 'oni',
      ...MONSTER_TEST_BODY,
      traits: [{ id: 'regen', preset: 'regeneration', hitPoints: 10 }],
    })
    expect(defaults.success).toBe(true)
    if (defaults.success) {
      const data = defaults.data as CreateMonsterInput
      expect(data.traits[0]).toMatchObject({
        hitPoints: 10,
        regeneratesAtZeroHp: false,
        interruptedByDamageTypes: [],
      })
    }
    expect(
      createMonsterDraftInputSchema.safeParse({
        slug: 'draft-regen',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'regen', preset: 'regeneration' }],
      }).success,
    ).toBe(true)
  })

  it('publishes a hold-breath preset', () => {
    const held = createMonsterInputSchema.safeParse({
      slug: 'hold',
      ...MONSTER_TEST_BODY,
      traits: [{ id: 'breath', preset: 'hold-breath', count: 60, unit: 'minute' }],
    })
    expect(held.success).toBe(true)
    if (held.success) {
      const data = held.data as CreateMonsterInput
      expect(data.traits[0]).toMatchObject({ count: 1, unit: 'hour' })
    }
  })

  it('publishes a standing-leap preset', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'leap',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'leap', preset: 'standing-leap', longJump: 15 }],
      }).success,
    ).toBe(true)
  })

  it('publishes a water-breathing preset', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'partial-water',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'water', preset: 'water-breathing', outsideWaterBreathAmount: 1 }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterDraftInputSchema.safeParse({
        slug: 'partial-water',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'water', preset: 'water-breathing', outsideWaterBreathAmount: 1 }],
      }).success,
    ).toBe(true)
  })

  it('publishes a pack-tactics preset', () => {
    const stripped = createMonsterInputSchema.safeParse({
      slug: 'pack-fields',
      ...MONSTER_TEST_BODY,
      traits: [{ id: 'pack', preset: 'pack-tactics', uses: 3 }],
    })
    expect(stripped.success).toBe(true)
    if (stripped.success) {
      const data = stripped.data as CreateMonsterInput
      expect(data.traits[0]).not.toHaveProperty('uses')
    }
  })

  it('publishes a bloodied-fury preset', () => {
    const fury = createMonsterInputSchema.safeParse({
      slug: 'boar',
      ...MONSTER_TEST_BODY,
      traits: [{ id: 'fury', preset: 'bloodied-fury', attackScope: 'any' }],
    })
    expect(fury.success).toBe(true)
  })

  it('publishes a berserk preset', () => {
    const calm = createMonsterInputSchema.safeParse({
      slug: 'clay',
      ...MONSTER_TEST_BODY,
      traits: [{ id: 'berserk', preset: 'berserk' }],
    })
    expect(calm.success).toBe(true)
    if (calm.success) {
      const data = calm.data as CreateMonsterInput
      expect(data.traits[0]).toMatchObject({ canBeCalmed: false })
    }
  })

  it('publishes an ethereal-sight preset', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'sight',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'sight', preset: 'ethereal-sight' }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterDraftInputSchema.safeParse({
        slug: 'sight',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'sight', preset: 'ethereal-sight' }],
      }).success,
    ).toBe(true)
  })

  it('publishes a stench preset', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'dc',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'stench', preset: 'stench', dc: 31, radius: 5 }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'radius',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'stench', preset: 'stench', dc: 10, radius: 4 }],
      }).success,
    ).toBe(false)
  })

  it('publishes a preset trait without a description and still requires custom prose', () => {
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'preset-trait',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'pack', preset: 'pack-tactics' }],
      }).success,
    ).toBe(true)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'custom-trait',
        ...MONSTER_TEST_BODY,
        traits: [{ id: 'eldritch', name: 'Eldritch Restoration' }],
      }).success,
    ).toBe(false)
    expect(
      createMonsterInputSchema.safeParse({
        slug: 'swarm-climb',
        ...MONSTER_TEST_BODY,
        name: 'Swarm of Insects',
        traits: [{ id: 'climb', preset: 'spider-climb' }],
      }).success,
    ).toBe(true)
  })

  it('rejects duplicate trait ids on publish and draft', () => {
    const traits = [
      { id: 'pack', name: 'Pack', description: '<p>A</p>' },
      { id: 'pack', name: 'Pack again', description: '<p>B</p>' },
    ]
    expect(
      createMonsterInputSchema.safeParse({ slug: 'dup-traits', ...MONSTER_TEST_BODY, traits })
        .success,
    ).toBe(false)
    expect(
      createMonsterDraftInputSchema.safeParse({ slug: 'dup-traits', ...MONSTER_TEST_BODY, traits })
        .success,
    ).toBe(false)
  })
})
