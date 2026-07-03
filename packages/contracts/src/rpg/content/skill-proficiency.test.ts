import { describe, expect, it } from 'vitest'
import {
  getSkillName,
  getSkillSentenceForm,
  skillSchema,
  skillProficiencyBodySchema,
  skillProficiencyPatchSchema,
  skillProficiencySchema,
  createSkillProficiencyInputSchema,
  updateSkillProficiencyInputSchema,
} from './skill-proficiency'

// ---------------------------------------------------------------------------
// Skill taxonomy
// ---------------------------------------------------------------------------

describe('skillSchema', () => {
  it('accepts slug-shaped ids including homebrew skills', () => {
    expect(skillSchema.parse('athletics')).toBe('athletics')
    expect(skillSchema.parse('custom-lockpicking')).toBe('custom-lockpicking')
  })

  it('rejects display labels and unknown values', () => {
    expect(skillSchema.safeParse('Animal Handling').success).toBe(false)
    expect(skillSchema.safeParse('lock_picking').success).toBe(false)
  })
})

describe('getSkillName', () => {
  it('returns title-cased slug fallback labels', () => {
    expect(getSkillName('animal-handling')).toBe('Animal Handling')
    expect(getSkillName('sleight-of-hand')).toBe('Sleight Of Hand')
  })

  it('falls back to the raw id for unknown/homebrew skills', () => {
    expect(getSkillName('custom-lockpicking')).toBe('Custom Lockpicking')
  })
})

describe('skill sentence forms', () => {
  it('returns sentence forms for generated prose', () => {
    expect(getSkillSentenceForm('animal-handling')).toBe('animal handling')
    expect(getSkillSentenceForm('sleight-of-hand')).toBe('sleight of hand')
    expect(getSkillSentenceForm('custom-lockpicking', 1, 'Lockpicking')).toBe('lockpicking')
  })
})

const athleticsBody = {
  name: 'Athletics',
  description: 'Difficult situations you face while climbing, jumping, or swimming.',
  ability: 'str',
  suggestedClasses: ['barbarian', 'fighter', 'paladin'],
} as const

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const athletics = {
  id: 'srd-cc-5.2.1:athletics',
  slug: 'athletics',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  ...timestamps,
  ...athleticsBody,
} as const

describe('skillProficiencySchema', () => {
  it('parses a well-formed system skill proficiency', () => {
    expect(skillProficiencySchema.parse(athletics)).toEqual(athletics)
  })

  it('parses a homebrew skill proficiency with a campaignId', () => {
    const homebrew = { ...athletics, source: 'homebrew', campaignId: 'camp_1' }
    expect(skillProficiencySchema.parse(homebrew)).toEqual(homebrew)
  })

  it('allows omitting optional fields (imageKey, description)', () => {
    const minimal = {
      ...athletics,
      description: undefined,
    }
    expect(skillProficiencySchema.safeParse(minimal).success).toBe(true)
  })

  it('requires at least one suggested class', () => {
    expect(skillProficiencySchema.safeParse({ ...athletics, suggestedClasses: [] }).success).toBe(
      false,
    )
    expect(
      skillProficiencySchema.safeParse({ ...athletics, suggestedClasses: undefined }).success,
    ).toBe(false)
  })

  it('rejects an invalid governing ability', () => {
    expect(skillProficiencySchema.safeParse({ ...athletics, ability: 'luck' }).success).toBe(false)
  })

  it('requires ability', () => {
    const { ability: _ability, ...withoutAbility } = athletics
    expect(skillProficiencySchema.safeParse(withoutAbility).success).toBe(false)
  })
})

describe('createSkillProficiencyInputSchema', () => {
  it('accepts a body plus a slug', () => {
    expect(
      createSkillProficiencyInputSchema.safeParse({ ...athleticsBody, slug: 'athletics' }).success,
    ).toBe(true)
  })

  it('requires a slug', () => {
    expect(createSkillProficiencyInputSchema.safeParse(athleticsBody).success).toBe(false)
  })

  it('rejects an invalid slug', () => {
    expect(
      createSkillProficiencyInputSchema.safeParse({ ...athleticsBody, slug: 'Athletics' }).success,
    ).toBe(false)
  })

  it('requires at least one suggested class', () => {
    expect(
      createSkillProficiencyInputSchema.safeParse({
        ...athleticsBody,
        suggestedClasses: [],
        slug: 'athletics',
      }).success,
    ).toBe(false)
  })
})

describe('updateSkillProficiencyInputSchema', () => {
  it('allows a partial body (including empty)', () => {
    expect(updateSkillProficiencyInputSchema.safeParse({}).success).toBe(true)
    expect(updateSkillProficiencyInputSchema.safeParse({ ability: 'dex' }).success).toBe(true)
  })

  it('still validates provided fields', () => {
    expect(updateSkillProficiencyInputSchema.safeParse({ ability: 'luck' }).success).toBe(false)
    expect(updateSkillProficiencyInputSchema.safeParse({ suggestedClasses: [] }).success).toBe(
      false,
    )
  })
})

describe('skillProficiencyPatchSchema', () => {
  it('accepts an overlay with a partial patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: athletics.id,
      patch: { description: 'Updated description.' },
      ...timestamps,
    }
    expect(skillProficiencyPatchSchema.safeParse(patch).success).toBe(true)
  })

  it('requires campaignId and targetId', () => {
    expect(
      skillProficiencyPatchSchema.safeParse({ id: 'patch_1', patch: {}, ...timestamps }).success,
    ).toBe(false)
  })

  it('validates fields inside the patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: athletics.id,
      patch: { ability: 'luck' },
      ...timestamps,
    }
    expect(skillProficiencyPatchSchema.safeParse(patch).success).toBe(false)
  })
})

describe('skillProficiencyBodySchema', () => {
  it('is the editable surface (no envelope fields)', () => {
    expect(skillProficiencyBodySchema.safeParse(athleticsBody).success).toBe(true)
    expect('id' in skillProficiencyBodySchema.shape).toBe(false)
  })
})
