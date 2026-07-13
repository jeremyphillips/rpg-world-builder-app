import { describe, expect, it } from 'vitest'

import {
  createSpellInputSchema,
  spellBodySchema,
  spellPatchSchema,
  spellSchema,
  updateSpellInputSchema,
} from './spell'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const fireBoltBody = {
  name: 'Fire Bolt',
  description:
    "<p>You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn't being worn or carried.</p>",
  cantripScaling:
    '<p>The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10).</p>',
  school: 'evocation',
  level: 0,
  classIds: ['sorcerer', 'wizard'],
  tags: {
    damageTypes: ['fire'],
    roles: ['damage'],
  },
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
  duration: { kind: 'instantaneous' },
  components: { verbal: true, somatic: true },
  deliveryMethod: 'ranged-spell-attack',
} as const

const fireBolt = {
  id: 'srd-cc-5.2.1:fire-bolt',
  slug: 'fire-bolt',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  ...timestamps,
  ...fireBoltBody,
} as const

describe('spellSchema', () => {
  it('parses a well-formed system spell', () => {
    expect(spellSchema.parse(fireBolt)).toEqual(fireBolt)
  })

  it('parses a homebrew spell with a campaignId', () => {
    const homebrew = { ...fireBolt, source: 'homebrew', campaignId: 'camp_1' }
    expect(spellSchema.parse(homebrew)).toEqual(homebrew)
  })

  it('allows optional scaling prose fields', () => {
    const withScaling = {
      ...fireBolt,
      higherLevelSlotEffect:
        '<p>The healing increases by 2d8 for each spell slot level above 1.</p>',
    }
    expect(spellSchema.parse(withScaling)).toEqual(withScaling)
  })

  it('allows omitting optional tags and deliveryMethod', () => {
    const minimal = {
      id: 'srd-cc-5.2.1:detect-magic',
      slug: 'detect-magic',
      rulesetId: 'srd-cc-5.2.1',
      source: 'system',
      campaignId: null,
      ...timestamps,
      name: 'Detect Magic',
      description: '<p>You sense magic within 30 feet.</p>',
      school: 'divination',
      level: 1,
      classIds: ['bard', 'cleric'],
      castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: true },
      range: { kind: 'self' },
      duration: { kind: 'timed', value: 10, unit: 'minute', concentration: true, upTo: true },
      components: { verbal: true, somatic: true },
    }
    expect(spellSchema.parse(minimal)).toEqual(minimal)
  })

  it('requires at least one classId', () => {
    expect(spellSchema.safeParse({ ...fireBolt, classIds: [] }).success).toBe(false)
  })

  it('requires at least one component', () => {
    expect(spellSchema.safeParse({ ...fireBolt, components: {} }).success).toBe(false)
  })

  it('rejects invalid range shapes', () => {
    expect(
      spellSchema.safeParse({
        ...fireBolt,
        range: { kind: 'distance' },
      }).success,
    ).toBe(false)
  })

  it('rejects invalid duration shapes', () => {
    expect(
      spellSchema.safeParse({
        ...fireBolt,
        duration: { kind: 'timed', value: 1 },
      }).success,
    ).toBe(false)
  })

  it('accepts reaction casting time with a trigger', () => {
    const hellishRebuke = {
      ...fireBolt,
      slug: 'hellish-rebuke',
      id: 'srd-cc-5.2.1:hellish-rebuke',
      level: 1,
      castingTime: {
        normal: {
          value: 1,
          unit: 'reaction',
          trigger: 'in response to taking damage from a creature that you can see within 60 feet',
        },
        canBeCastAsRitual: false,
      },
    }
    expect(spellSchema.parse(hellishRebuke)).toEqual(hellishRebuke)
  })
})

describe('spellBodySchema', () => {
  it('parses the editable body without envelope fields', () => {
    expect(spellBodySchema.parse(fireBoltBody)).toEqual(fireBoltBody)
  })
})

describe('createSpellInputSchema', () => {
  it('requires a slug', () => {
    expect(createSpellInputSchema.safeParse(fireBoltBody).success).toBe(false)
    expect(createSpellInputSchema.parse({ slug: 'fire-bolt', ...fireBoltBody })).toEqual({
      slug: 'fire-bolt',
      ...fireBoltBody,
    })
  })
})

describe('updateSpellInputSchema', () => {
  it('allows partial updates', () => {
    expect(updateSpellInputSchema.parse({ name: 'Ember Bolt' })).toEqual({ name: 'Ember Bolt' })
  })
})

describe('spellPatchSchema', () => {
  it('accepts an overlay with a partial patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: fireBolt.id,
      patch: { name: 'Ember Bolt' },
      ...timestamps,
    }
    expect(spellPatchSchema.parse(patch)).toEqual(patch)
  })

  it('requires campaignId and targetId', () => {
    expect(spellPatchSchema.safeParse({ id: 'patch_1', patch: {}, ...timestamps }).success).toBe(
      false,
    )
  })
})

describe('spellContentLevelSchema', () => {
  it('accepts cantrip level 0 and 9th-level slots', () => {
    expect(spellSchema.parse({ ...fireBolt, level: 0 }).level).toBe(0)
    expect(spellSchema.parse({ ...fireBolt, level: 9 }).level).toBe(9)
  })

  it('rejects levels outside 0–9', () => {
    expect(spellSchema.safeParse({ ...fireBolt, level: 10 }).success).toBe(false)
    expect(spellSchema.safeParse({ ...fireBolt, level: -1 }).success).toBe(false)
  })
})
