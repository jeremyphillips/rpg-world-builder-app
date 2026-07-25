import { describe, expect, it } from 'vitest'
import {
  classBodySchema,
  classFeatureSchema,
  classHasSpellcasting,
  classListItemSchema,
  classPatchSchema,
  classSchema,
  classStoredBodySchema,
  classStoredSchema,
  createClassDraftInputSchema,
  createClassInputSchema,
  subclassChoiceFeature,
  subclassChoiceFeatureId,
  subclassChoiceFeatureLabel,
  subclassChoiceFeatureLevel,
  subclassPatchSchema,
  resolvedSubclassSchema,
  subclassSchema,
  updateClassInputSchema,
} from './class'

const fighterStoredBody = {
  name: 'Fighter',
  description: '<p>A master of martial combat.</p>',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium', 'heavy', 'shields'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [
          {
            id: 'class-skills',
            label: 'Fighter Skills',
            choose: 2,
            from: ['acrobatics', 'athletics', 'history'],
          },
        ],
      },
    },
  },
  features: [
    { kind: 'custom', id: 'second-wind', name: 'Second Wind', level: 1 },
    { kind: 'subclass-choice', id: 'fighter-subclass', name: 'Fighter Subclass', level: 3 },
  ],
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
  status: 'published',
  campaignId: null,
  ...timestamps,
  ...fighterStoredBody,
} as const

describe('classHasSpellcasting', () => {
  it('returns false when spellcasting is absent', () => {
    expect(classHasSpellcasting(classSchema.parse(fighter))).toBe(false)
  })

  it('returns true when spellcasting is present', () => {
    expect(
      classHasSpellcasting(
        classSchema.parse({
          ...fighter,
          spellcasting: {
            level: 1,
            progression: 'full',
            ability: 'int',
            preparation: 'prepared',
          },
        }),
      ),
    ).toBe(true)
  })
})

describe('classListItemSchema', () => {
  it('extends class rows with subclass summaries', () => {
    expect(
      classListItemSchema.parse({
        ...fighter,
        subclasses: [{ id: 'champion', name: 'Champion' }],
      }),
    ).toEqual({
      ...fighter,
      subclasses: [{ id: 'champion', name: 'Champion' }],
    })
  })
})

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
      proficiencies: { ...fighter.proficiencies, savingThrows },
    })
    expect(classSchema.safeParse(withSaves(['str'])).success).toBe(true)
    expect(classSchema.safeParse(withSaves(['str', 'con', 'dex'])).success).toBe(true)
    expect(classSchema.safeParse(withSaves([])).success).toBe(false)
    expect(classSchema.safeParse(withSaves(['str', 'con', 'dex', 'wis'])).success).toBe(false)
  })

  it('rejects a hit die outside the class range', () => {
    expect(classSchema.safeParse({ ...fighter, hitDie: 4 }).success).toBe(false)
  })

  it('parses class features with optional grant groups', () => {
    const withGrants = {
      ...fighter,
      features: [
        {
          kind: 'custom',
          id: 'words-of-creation',
          name: 'Words of Creation',
          level: 20,
          description: '<p>You always have Power Word Heal and Power Word Kill prepared.</p>',
          grantGroups: [
            {
              grants: [
                {
                  kind: 'spells',
                  ability: 'cha',
                  availability: 'always_prepared',
                  spellIds: ['power-word-heal', 'power-word-kill'],
                },
              ],
            },
          ],
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

  it('rejects legacy proficiencies.skills.choose shape', () => {
    expect(
      createClassInputSchema.safeParse({
        ...fighterStoredBody,
        slug: 'fighter',
        proficiencies: {
          ...fighterStoredBody.proficiencies,
          skills: { choose: 2 },
        },
      }).success,
    ).toBe(false)
  })
})

describe('createClassDraftInputSchema', () => {
  it('accepts minimal draft payloads and applies untitled name fallback', () => {
    const parsed = createClassDraftInputSchema.parse({
      slug: 'draft-class',
      name: '',
      hitDie: 8,
    })
    expect(parsed.name).toBe('Untitled Class')
    expect(parsed.hitDie).toBe(8)
    expect(parsed.features).toEqual([])
  })

  it('allows empty saving throws and skill choice groups on draft', () => {
    expect(
      createClassDraftInputSchema.safeParse({
        slug: 'draft-class',
        name: 'Draft Class',
        proficiencies: {
          savingThrows: [],
          armor: { categories: [], items: [] },
          weapons: { categories: [], items: [] },
          skills: { categories: [], items: [] },
        },
        characterCreation: {
          proficiencies: {
            skills: { choices: [] },
          },
        },
      }).success,
    ).toBe(true)
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
      status: 'published',
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
      status: 'published',
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
        status: 'published',
        campaignId: null,
        ...timestamps,
        name: 'Champion',
      }).success,
    ).toBe(false)
  })
})

describe('resolvedSubclassSchema', () => {
  it('extends subclass with campaignAccess list metadata', () => {
    expect(
      resolvedSubclassSchema.parse({
        id: 'srd-cc-5.2.1:champion',
        slug: 'champion',
        rulesetId: 'srd-cc-5.2.1',
        source: 'system',
        status: 'published',
        campaignId: null,
        ...timestamps,
        classId: fighter.id,
        name: 'Champion',
        campaignAccess: {
          available: false,
          visibilityMode: 'all_players',
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'none',
        },
      }).campaignAccess.effectiveAudience,
    ).toBe('none')
  })
})

describe('subclassChoiceFeatureLabel', () => {
  it('formats the class name with a Subclass suffix', () => {
    expect(subclassChoiceFeatureLabel('Bard')).toBe('Bard Subclass')
  })

  it('formats the stable feature id from the class slug', () => {
    expect(subclassChoiceFeatureId('bard')).toBe('bard-subclass')
  })

  it('derives the subclass choice feature and level from class features', () => {
    expect(subclassChoiceFeature(fighter)?.name).toBe('Fighter Subclass')
    expect(subclassChoiceFeatureLevel(fighter)).toBe(3)
  })
})

describe('subclass-choice class feature kind', () => {
  it('parses subclass-choice features separately from custom', () => {
    const feature = classFeatureSchema.parse({
      kind: 'subclass-choice',
      id: 'bard-subclass',
      name: 'Bard Subclass',
      level: 3,
    })
    expect(feature.kind).toBe('subclass-choice')
  })

  it('rejects subclass-choice rows with an invalid kind literal', () => {
    expect(
      classFeatureSchema.safeParse({
        kind: 'custom',
        id: 'bard-subclass',
        name: 'Bard Subclass',
        level: 3,
      }).success,
    ).toBe(true)
    expect(
      classFeatureSchema.safeParse({
        kind: 'subclass-choice',
        id: 'second-wind',
        name: 'Second Wind',
        level: 1,
      }).success,
    ).toBe(true)
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

describe('classBodySchema', () => {
  it('is the read surface (no envelope fields)', () => {
    expect(classBodySchema.safeParse(fighterStoredBody).success).toBe(true)
    expect('id' in classBodySchema.shape).toBe(false)
  })
})

describe('classStoredBodySchema', () => {
  it('parses class-owned skill choices under characterCreation', () => {
    expect(classStoredBodySchema.safeParse(fighterStoredBody).success).toBe(true)
  })

  it('parses tool proficiencies with categories and items', () => {
    expect(
      classStoredBodySchema.safeParse({
        ...fighterStoredBody,
        proficiencies: {
          ...fighterStoredBody.proficiencies,
          tools: { categories: [], items: ['thieves-tools'] },
        },
      }).success,
    ).toBe(true)
  })

  it('rejects placeholder-only skill choice groups', () => {
    expect(
      classStoredBodySchema.safeParse({
        ...fighterStoredBody,
        characterCreation: {
          proficiencies: {
            skills: {
              choices: [{ id: 'class-skills', choose: 0, from: [] }],
            },
          },
        },
      }).success,
    ).toBe(false)
  })
})

describe('classStoredSchema', () => {
  it('parses seed/homebrew records with class-owned proficiency choices', () => {
    expect(
      classStoredSchema.safeParse({
        id: 'srd-cc-5.2.1:fighter',
        slug: 'fighter',
        rulesetId: 'srd-cc-5.2.1',
        source: 'system',
        status: 'published',
        campaignId: null,
        ...timestamps,
        ...fighterStoredBody,
      }).success,
    ).toBe(true)
  })
})

describe('classFeatureSchema — grantGroups superRefine', () => {
  const baseFeature = { kind: 'custom' as const, id: 'smite', name: 'Divine Smite', level: 3 }
  const senseGrant = { kind: 'sense' as const, type: 'darkvision', range: 60 }
  const spellGrant = {
    kind: 'spells' as const,
    ability: 'wis' as const,
    availability: 'always_prepared' as const,
    spellIds: ['bless'],
  }

  it('accepts a feature with no grantGroups', () => {
    expect(classFeatureSchema.safeParse(baseFeature).success).toBe(true)
  })

  it('accepts a feature with a valid default-only grantGroups', () => {
    expect(
      classFeatureSchema.safeParse({
        ...baseFeature,
        grantGroups: [{ grants: [senseGrant] }],
      }).success,
    ).toBe(true)
  })

  it('accepts a feature with a level-gated group above the feature level', () => {
    expect(
      classFeatureSchema.safeParse({
        ...baseFeature,
        grantGroups: [{ unlock: { level: 9 }, grants: [spellGrant] }],
      }).success,
    ).toBe(true)
  })

  it('rejects a grant group whose unlock level equals the feature level', () => {
    expect(
      classFeatureSchema.safeParse({
        ...baseFeature,
        grantGroups: [{ unlock: { level: 3 }, grants: [spellGrant] }],
      }).success,
    ).toBe(false)
  })

  it('rejects a grant group whose unlock level is below the feature level', () => {
    expect(
      classFeatureSchema.safeParse({
        ...baseFeature,
        grantGroups: [{ unlock: { level: 1 }, grants: [spellGrant] }],
      }).success,
    ).toBe(false)
  })
})
