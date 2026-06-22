import { describe, expect, it } from 'vitest'
import {
  classBodySchema,
  classPatchSchema,
  classSchema,
  classStoredBodySchema,
  classStoredSchema,
  createClassInputSchema,
  subclassChoiceFeatureLabel,
  subclassPatchSchema,
  subclassCampaignAvailabilitySchema,
  subclassSchema,
  updateClassInputSchema,
} from './class'

const fighterStoredBody = {
  name: 'Fighter',
  description: '<p>A master of martial combat.</p>',
  primaryAbilities: ['str'],
  hitDie: 10,
  asiLevels: [4, 6, 8, 12, 14, 16, 19],
  subclassChoiceLevel: 3,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: ['light', 'medium', 'heavy', 'shields'],
    weapons: { categories: ['simple', 'martial'] },
    skills: { choose: 2 },
  },
  features: [{ kind: 'custom', id: 'second-wind', name: 'Second Wind', level: 1 }],
} as const

const fighterBody = {
  ...fighterStoredBody,
  proficiencies: {
    ...fighterStoredBody.proficiencies,
    skills: { choose: 2, from: ['acrobatics', 'athletics', 'history'] },
  },
} as const

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const fighter = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  ...timestamps,
  ...fighterBody,
} as const

describe('classSchema', () => {
  it('parses a well-formed system class', () => {
    expect(classSchema.parse(fighter)).toEqual(fighter)
  })

  it('parses a homebrew class with a campaignId', () => {
    const homebrew = { ...fighter, source: 'homebrew', campaignId: 'camp_1' }
    expect(classSchema.parse(homebrew)).toEqual(homebrew)
  })

  it('allows 1–3 saving throws (relaxed for homebrew) but rejects 0 or 4', () => {
    const withSaves = (savingThrows: string[]) => ({
      ...fighter,
      proficiencies: { ...fighterBody.proficiencies, savingThrows },
    })
    expect(classSchema.safeParse(withSaves(['str'])).success).toBe(true)
    expect(classSchema.safeParse(withSaves(['str', 'con', 'dex'])).success).toBe(true)
    expect(classSchema.safeParse(withSaves([])).success).toBe(false)
    expect(classSchema.safeParse(withSaves(['str', 'con', 'dex', 'wis'])).success).toBe(false)
  })

  it('allows omitting subclassChoiceLevel', () => {
    const { subclassChoiceLevel: _, ...withoutChoice } = fighter
    expect(classSchema.safeParse(withoutChoice).success).toBe(true)
  })

  it('rejects an invalid subclassChoiceLevel', () => {
    expect(classSchema.safeParse({ ...fighter, subclassChoiceLevel: 0 }).success).toBe(false)
  })

  it('rejects a hit die outside the class range', () => {
    expect(classSchema.safeParse({ ...fighter, hitDie: 4 }).success).toBe(false)
  })

  it('parses class features with optional grants', () => {
    const withGrants = {
      ...fighter,
      features: [
        {
          kind: 'custom',
          id: 'words-of-creation',
          name: 'Words of Creation',
          level: 20,
          description: '<p>You always have Power Word Heal and Power Word Kill prepared.</p>',
          grants: {
            innateSpells: {
              ability: 'cha',
              entries: [
                {
                  level: 20,
                  kind: 'always_prepared',
                  spellIds: ['power-word-heal', 'power-word-kill'],
                },
              ],
            },
          },
        },
      ],
    }
    expect(classSchema.parse(withGrants)).toEqual(withGrants)
  })
})

describe('createClassInputSchema', () => {
  it('accepts a stored body plus a slug', () => {
    expect(
      createClassInputSchema.safeParse({ ...fighterStoredBody, slug: 'fighter' }).success,
    ).toBe(true)
  })

  it('requires a slug', () => {
    expect(createClassInputSchema.safeParse(fighterStoredBody).success).toBe(false)
  })

  it('rejects an invalid slug', () => {
    expect(
      createClassInputSchema.safeParse({ ...fighterStoredBody, slug: 'Fighter' }).success,
    ).toBe(false)
  })

  it('rejects persisted skills.from on create', () => {
    expect(createClassInputSchema.safeParse({ ...fighterBody, slug: 'fighter' }).success).toBe(
      false,
    )
  })
})

describe('updateClassInputSchema', () => {
  it('allows a partial body (including empty)', () => {
    expect(updateClassInputSchema.safeParse({}).success).toBe(true)
    expect(updateClassInputSchema.safeParse({ hitDie: 12 }).success).toBe(true)
  })

  it('still validates provided fields', () => {
    expect(updateClassInputSchema.safeParse({ hitDie: 4 }).success).toBe(false)
  })
})

describe('classPatchSchema', () => {
  it('accepts an overlay with a partial patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: fighter.id,
      patch: { hitDie: 12 },
      ...timestamps,
    }
    expect(classPatchSchema.safeParse(patch).success).toBe(true)
  })

  it('requires campaignId and targetId', () => {
    expect(classPatchSchema.safeParse({ id: 'patch_1', patch: {}, ...timestamps }).success).toBe(
      false,
    )
  })

  it('validates fields inside the patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: fighter.id,
      patch: { hitDie: 4 },
      ...timestamps,
    }
    expect(classPatchSchema.safeParse(patch).success).toBe(false)
  })
})

describe('subclassSchema', () => {
  it('parses a subclass referencing its parent class id', () => {
    const champion = {
      id: 'srd-cc-5.2.1:champion',
      slug: 'champion',
      rulesetId: 'srd-cc-5.2.1',
      source: 'system',
      campaignId: null,
      ...timestamps,
      classId: fighter.id,
      name: 'Champion',
      description:
        '<p>Fighters who pursue physical excellence and devastating critical strikes.</p>',
    }
    expect(subclassSchema.parse(champion)).toEqual({ ...champion, features: [] })
  })

  it('parses subclass features with optional grants', () => {
    const lore = {
      id: 'srd-cc-5.2.1:college-of-lore',
      slug: 'college-of-lore',
      rulesetId: 'srd-cc-5.2.1',
      source: 'system',
      campaignId: null,
      ...timestamps,
      classId: 'srd-cc-5.2.1:bard',
      name: 'College of Lore',
      description: '<p>Bards who collect knowledge.</p>',
      features: [
        {
          kind: 'custom',
          id: 'bonus-proficiencies',
          name: 'Bonus Proficiencies',
          level: 3,
          description: '<p>You gain proficiency with three skills of your choice.</p>',
        },
      ],
    }
    expect(subclassSchema.parse(lore)).toEqual(lore)
  })

  it('requires a classId', () => {
    expect(
      subclassSchema.safeParse({
        id: 'srd-cc-5.2.1:champion',
        slug: 'champion',
        rulesetId: 'srd-cc-5.2.1',
        source: 'system',
        campaignId: null,
        ...timestamps,
        name: 'Champion',
      }).success,
    ).toBe(false)
  })
})

describe('subclassChoiceFeatureLabel', () => {
  it('formats the class name with a Subclass suffix', () => {
    expect(subclassChoiceFeatureLabel('Bard')).toBe('Bard Subclass')
  })
})

describe('subclassPatchSchema', () => {
  it('accepts an overlay with a partial patch body', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_1',
      targetId: 'srd-cc-5.2.1:champion',
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
      patch: { name: 'Champion (Custom)' },
    }
    expect(subclassPatchSchema.safeParse(patch).success).toBe(true)
    expect(subclassPatchSchema.parse(patch).patch).toEqual({ name: 'Champion (Custom)' })
  })
})

describe('subclassCampaignAvailabilitySchema', () => {
  it('parses campaign-scoped active flag', () => {
    const availability = {
      campaignId: 'camp_1',
      targetId: 'srd-cc-5.2.1:champion',
      activeInCampaign: false,
    }
    expect(subclassCampaignAvailabilitySchema.parse(availability)).toEqual(availability)
  })
})

describe('classBodySchema', () => {
  it('is the read surface (no envelope fields)', () => {
    expect(classBodySchema.safeParse(fighterBody).success).toBe(true)
    expect('id' in classBodySchema.shape).toBe(false)
  })
})

describe('classStoredBodySchema', () => {
  it('is the persisted surface without derived skills.from', () => {
    expect(classStoredBodySchema.safeParse(fighterStoredBody).success).toBe(true)
    expect(
      classStoredBodySchema.safeParse({
        ...fighterStoredBody,
        proficiencies: {
          ...fighterStoredBody.proficiencies,
          skills: { choose: 2, from: ['athletics'] },
        },
      }).success,
    ).toBe(false)
  })
})

describe('classStoredSchema', () => {
  it('parses seed/homebrew records without skills.from', () => {
    expect(
      classStoredSchema.safeParse({
        id: 'srd-cc-5.2.1:fighter',
        slug: 'fighter',
        rulesetId: 'srd-cc-5.2.1',
        source: 'system',
        campaignId: null,
        ...timestamps,
        ...fighterStoredBody,
      }).success,
    ).toBe(true)
  })
})
