import { describe, expect, it } from 'vitest'

import {
  formatFeatureRequirement,
  formatRequirementExpression,
  requirementExpressionSchema,
  type RequirementExpression,
} from './requirement-expression'

const grapplerPrerequisite: RequirementExpression = {
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
}

describe('requirementExpressionSchema', () => {
  it('accepts a single minLevel leaf', () => {
    expect(requirementExpressionSchema.parse({ kind: 'minLevel', level: 4 })).toEqual({
      kind: 'minLevel',
      level: 4,
    })
  })

  it('accepts nested all/any trees', () => {
    expect(requirementExpressionSchema.parse(grapplerPrerequisite)).toEqual(grapplerPrerequisite)
  })

  it('accepts spell recall prerequisites', () => {
    const expr: RequirementExpression = {
      kind: 'all',
      requirements: [{ kind: 'minLevel', level: 19 }, { kind: 'spellcasting' }],
    }
    expect(requirementExpressionSchema.parse(expr)).toEqual(expr)
  })

  it('defaults classLevel minimum to 1', () => {
    expect(requirementExpressionSchema.parse({ kind: 'classLevel', classSlug: 'fighter' })).toEqual(
      {
        kind: 'classLevel',
        classSlug: 'fighter',
        minimum: 1,
      },
    )
  })

  it('rejects empty compositor groups', () => {
    expect(requirementExpressionSchema.safeParse({ kind: 'all', requirements: [] }).success).toBe(
      false,
    )
    expect(requirementExpressionSchema.safeParse({ kind: 'any', requirements: [] }).success).toBe(
      false,
    )
  })

  it('rejects invalid ability minimums', () => {
    expect(
      requirementExpressionSchema.safeParse({
        kind: 'abilityMinimum',
        ability: 'str',
        minimum: 0,
      }).success,
    ).toBe(false)
  })
})

describe('formatRequirementExpression', () => {
  it('formats a single minLevel leaf', () => {
    expect(formatRequirementExpression({ kind: 'minLevel', level: 4 })).toBe('Level 4+')
  })

  it('collapses OR ability minimums with the same floor', () => {
    expect(formatRequirementExpression(grapplerPrerequisite)).toBe(
      'Level 4+, Strength or Dexterity 13+',
    )
    expect(formatRequirementExpression(grapplerPrerequisite, { abilityDisplay: 'id' })).toBe(
      'Level 4+, STR or DEX 13+',
    )
  })

  it('formats fighting style feature prerequisites', () => {
    expect(formatRequirementExpression({ kind: 'feature', featureId: 'fighting-style' })).toBe(
      'Fighting Style Feature',
    )
  })

  it('formats spell recall prerequisites', () => {
    expect(
      formatRequirementExpression({
        kind: 'all',
        requirements: [{ kind: 'minLevel', level: 19 }, { kind: 'spellcasting' }],
      }),
    ).toBe('Level 19+, Spellcasting Feature')
  })

  it('joins distinct any branches with or', () => {
    expect(
      formatRequirementExpression({
        kind: 'any',
        requirements: [
          { kind: 'minLevel', level: 4 },
          { kind: 'minLevel', level: 19 },
        ],
      }),
    ).toBe('Level 4+ or Level 19+')
  })
})

describe('formatFeatureRequirement', () => {
  it('title-cases kebab-case ids', () => {
    expect(formatFeatureRequirement('fighting-style')).toBe('Fighting Style Feature')
  })
})
