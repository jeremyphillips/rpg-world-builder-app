import { describe, expect, it } from 'vitest'

import {
  createFeatInputSchema,
  featBodySchema,
  featPatchSchema,
  featSchema,
  updateFeatInputSchema,
} from './feat'

const grapplerBody = {
  name: 'Grappler',
  category: 'general',
  prerequisite: {
    kind: 'all',
    requirements: [
      { kind: 'minLevel', level: 4 },
      {
        kind: 'any',
        requirements: [
          { kind: 'abilityMinimum', ability: 'str', minimum: 13 },
          { kind: 'abilityMinimum', ability: 'dex', minimum: 13 },
        ],
      },
    ],
  },
  repeatable: { allowed: false },
  description:
    '<p>You gain the following benefits.</p><p><strong>Ability Score Increase.</strong> Increase your Strength or Dexterity score by 1, to a maximum of 20.</p>',
} as const

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const grappler = {
  id: 'srd-cc-5.2.1:grappler',
  slug: 'grappler',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  ...timestamps,
  ...grapplerBody,
} as const

describe('featSchema', () => {
  it('parses a well-formed system feat', () => {
    expect(featSchema.parse(grappler)).toEqual(grappler)
  })

  it('parses a homebrew feat with a campaignId', () => {
    const homebrew = { ...grappler, source: 'homebrew', campaignId: 'camp_1' }
    expect(featSchema.parse(homebrew)).toEqual(homebrew)
  })

  it('defaults repeatable to not allowed when omitted', () => {
    const { repeatable: _repeatable, ...withoutRepeatable } = grapplerBody
    const parsed = featSchema.parse({
      ...grappler,
      ...withoutRepeatable,
    })
    expect(parsed.repeatable).toEqual({ allowed: false })
  })

  it('accepts repeatable feats with notes', () => {
    const repeatable = {
      ...grappler,
      slug: 'magic-initiate',
      name: 'Magic Initiate',
      category: 'origin',
      prerequisite: undefined,
      repeatable: {
        allowed: true,
        notes:
          '<p>You can take this feat more than once, but you must choose a different spell list each time.</p>',
      },
    }
    expect(featSchema.parse(repeatable)).toEqual(repeatable)
  })

  it('rejects repeatable notes when not allowed', () => {
    expect(
      featSchema.safeParse({
        ...grappler,
        repeatable: { allowed: false, notes: '<p>Nope</p>' },
      }).success,
    ).toBe(false)
  })

  it('rejects an invalid category', () => {
    expect(featSchema.safeParse({ ...grappler, category: 'custom' }).success).toBe(false)
  })

  it('allows omitting optional fields (imageKey, description, prerequisite, benefit)', () => {
    const minimal = {
      ...grappler,
      description: undefined,
      prerequisite: undefined,
    }
    expect(featSchema.safeParse(minimal).success).toBe(true)
  })
})

describe('createFeatInputSchema', () => {
  it('accepts a body plus a slug', () => {
    expect(createFeatInputSchema.safeParse({ ...grapplerBody, slug: 'grappler' }).success).toBe(
      true,
    )
  })

  it('requires a slug', () => {
    expect(createFeatInputSchema.safeParse(grapplerBody).success).toBe(false)
  })

  it('rejects an invalid slug', () => {
    expect(createFeatInputSchema.safeParse({ ...grapplerBody, slug: 'Grappler' }).success).toBe(
      false,
    )
  })
})

describe('updateFeatInputSchema', () => {
  it('allows a partial body (including empty)', () => {
    expect(updateFeatInputSchema.safeParse({}).success).toBe(true)
    expect(updateFeatInputSchema.safeParse({ category: 'origin' }).success).toBe(true)
  })

  it('still validates provided fields', () => {
    expect(updateFeatInputSchema.safeParse({ category: 'custom' }).success).toBe(false)
  })
})

describe('featPatchSchema', () => {
  it('accepts an overlay with a partial patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: grappler.id,
      patch: { description: '<p>Updated benefit prose.</p>' },
      ...timestamps,
    }
    expect(featPatchSchema.safeParse(patch).success).toBe(true)
  })

  it('requires campaignId and targetId', () => {
    expect(featPatchSchema.safeParse({ id: 'patch_1', patch: {}, ...timestamps }).success).toBe(
      false,
    )
  })

  it('validates fields inside the patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: grappler.id,
      patch: { category: 'custom' },
      ...timestamps,
    }
    expect(featPatchSchema.safeParse(patch).success).toBe(false)
  })
})

describe('featBodySchema', () => {
  it('is the editable surface (no envelope fields)', () => {
    expect(featBodySchema.safeParse(grapplerBody).success).toBe(true)
    expect('id' in featBodySchema.shape).toBe(false)
  })
})
