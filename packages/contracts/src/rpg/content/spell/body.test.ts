import { describe, expect, it } from 'vitest'

import {
  createSpellInputSchema,
  spellBodySchema,
  spellPatchSchema,
  spellSchema,
  updateSpellInputSchema,
} from './body'
import { CHILL_TOUCH_RESOLUTION, ELDRITCH_BLAST_RESOLUTION } from './resolution/fixtures'

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

const fireballBody = {
  name: 'Fireball',
  description:
    "<p>A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.</p><p>Flammable objects in the area that aren't being worn or carried start burning.</p>",
  higherLevelSlotEffect: '<p>The damage increases by 1d6 for each spell slot level above 3.</p>',
  school: 'evocation',
  level: 3,
  classIds: ['sorcerer', 'wizard'],
  tags: {
    damageTypes: ['fire'],
    roles: ['damage'],
  },
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance', value: { value: 150, unit: 'ft' } },
  areaOfEffect: { shape: 'sphere', radius: { value: 20, unit: 'ft' } },
  duration: { kind: 'instantaneous' },
  components: {
    verbal: true,
    somatic: true,
    material: { description: 'a ball of bat guano and sulfur' },
  },
} as const

const fireball = {
  id: 'srd-cc-5.2.1:fireball',
  slug: 'fireball',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  ...timestamps,
  ...fireballBody,
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

  it('parses a spell with range and areaOfEffect kept separate', () => {
    expect(spellSchema.parse(fireball)).toEqual(fireball)
  })

  it('allows omitting optional areaOfEffect', () => {
    expect(spellSchema.parse(fireBolt)).toEqual(fireBolt)
    expect(spellSchema.parse(fireBolt).areaOfEffect).toBeUndefined()
  })

  it('rejects invalid areaOfEffect shapes', () => {
    expect(
      spellSchema.safeParse({
        ...fireball,
        areaOfEffect: { shape: 'sphere' },
      }).success,
    ).toBe(false)

    expect(
      spellSchema.safeParse({
        ...fireball,
        areaOfEffect: {
          shape: 'cone',
          length: { value: 15, unit: 'ft' },
          radius: { value: 15, unit: 'ft' },
        },
      }).success,
    ).toBe(false)

    expect(
      spellSchema.safeParse({
        ...fireball,
        areaOfEffect: {
          shape: 'line',
          length: { value: 30, unit: 'ft' },
        },
      }).success,
    ).toBe(false)

    expect(
      spellSchema.safeParse({
        ...fireball,
        areaOfEffect: { shape: 'special', description: '   ' },
      }).success,
    ).toBe(false)

    expect(
      spellSchema.safeParse({
        ...fireball,
        areaOfEffect: { shape: 'hexagon', radius: { value: 10, unit: 'ft' } },
      }).success,
    ).toBe(false)
  })
})

describe('spellBodySchema', () => {
  it('parses the editable body without envelope fields', () => {
    expect(spellBodySchema.parse(fireBoltBody)).toEqual(fireBoltBody)
  })

  it('parses areaOfEffect on the body', () => {
    expect(spellBodySchema.parse(fireballBody)).toEqual(fireballBody)
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

describe('spell effects schema', () => {
  const sampleEffect = {
    id: 'fx-1',
    kind: 'damage' as const,
    roll: { dice: { count: 1, faces: 10 } },
    damageType: 'fire',
  }

  it('accepts optional effects on the stored spell shape', () => {
    expect(spellSchema.parse({ ...fireBolt, effects: [sampleEffect] }).effects).toEqual([
      sampleEffect,
    ])
  })

  it('omits effects from create/update input schemas until persistence lands', () => {
    expect('effects' in createSpellInputSchema.shape).toBe(false)
    expect('effects' in updateSpellInputSchema.shape).toBe(false)
    const parsed = createSpellInputSchema.parse({
      slug: 'fire-bolt',
      ...fireBoltBody,
      effects: [sampleEffect],
    } as Parameters<typeof createSpellInputSchema.parse>[0] & {
      effects: (typeof sampleEffect)[]
    })
    expect('effects' in parsed).toBe(false)
  })

  it('allows effects in patch bodies for future overlay authoring', () => {
    expect(
      spellPatchSchema.parse({
        id: 'patch_1',
        campaignId: 'camp_1',
        targetId: 'srd-cc-5.2.1:fire-bolt',
        patch: { effects: [sampleEffect] },
        ...timestamps,
      }).patch.effects,
    ).toEqual([sampleEffect])
  })
})

describe('spell resolution schema', () => {
  it('accepts optional resolution on the stored spell shape', () => {
    expect(
      spellSchema.parse({ ...fireBolt, resolution: ELDRITCH_BLAST_RESOLUTION }).resolution,
    ).toEqual(ELDRITCH_BLAST_RESOLUTION)
  })

  it('omits resolution from create/update input schemas until persistence lands', () => {
    expect('resolution' in createSpellInputSchema.shape).toBe(false)
    expect('resolution' in updateSpellInputSchema.shape).toBe(false)

    const parsed = createSpellInputSchema.parse({
      slug: 'fire-bolt',
      ...fireBoltBody,
      resolution: ELDRITCH_BLAST_RESOLUTION,
    } as Parameters<typeof createSpellInputSchema.parse>[0] & {
      resolution: typeof ELDRITCH_BLAST_RESOLUTION
    })
    expect('resolution' in parsed).toBe(false)
  })

  it('allows resolution in patch bodies for future overlay authoring', () => {
    expect(
      spellPatchSchema.parse({
        id: 'patch_2',
        campaignId: 'camp_1',
        targetId: 'srd-cc-5.2.1:chill-touch',
        patch: { resolution: CHILL_TOUCH_RESOLUTION },
        ...timestamps,
      }).patch.resolution,
    ).toEqual(CHILL_TOUCH_RESOLUTION)
  })
})
