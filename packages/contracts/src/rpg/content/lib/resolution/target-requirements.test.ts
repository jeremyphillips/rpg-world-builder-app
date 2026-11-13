import { describe, expect, it } from 'vitest'

import { resolutionTargetSchema } from './schema'
import {
  resolutionTargetRequirementValidationMessages,
  resolutionTargetRequirementsSchema,
} from './target-requirements'

const distance = { kind: 'distance' as const, distance: { value: 5, unit: 'ft' as const } }

function target(
  requirements: unknown[],
  kind: 'creature' | 'object' | 'creature-or-object' = 'creature',
) {
  return resolutionTargetSchema.safeParse({
    count: 1,
    kind,
    proximity: distance,
    requirements,
  })
}

describe('resolution target requirements', () => {
  it('treats listed types and conditions as any or none, and rows as and', () => {
    const parsed = target([
      { kind: 'creature-type', mode: 'include', ids: ['humanoid', 'giant'] },
      { kind: 'condition', presence: 'lacks', ids: ['incapacitated'] },
      { kind: 'sight', who: 'actor' },
    ])
    expect(parsed.success).toBe(true)
  })

  it('rejects duplicate ids, duplicate kinds, and willing beside any-of', () => {
    expect(
      resolutionTargetRequirementsSchema.safeParse([
        { kind: 'condition', presence: 'has', ids: ['grappled', 'grappled'] },
      ]).success,
    ).toBe(false)

    const duplicateKind = resolutionTargetRequirementsSchema.safeParse([
      { kind: 'willing' },
      { kind: 'willing' },
    ])
    expect(duplicateKind.success).toBe(false)
    if (!duplicateKind.success) {
      expect(duplicateKind.error.issues.map((issue) => issue.message)).toContain(
        resolutionTargetRequirementValidationMessages.duplicateKind(),
      )
    }

    const mixed = resolutionTargetRequirementsSchema.safeParse([
      { kind: 'willing' },
      { kind: 'any-of', willing: true },
    ])
    expect(mixed.success).toBe(false)
    if (!mixed.success) {
      expect(mixed.error.issues.map((issue) => issue.message)).toContain(
        resolutionTargetRequirementValidationMessages.willingWithAnyOf(),
      )
    }

    const conditionAndAnyOf = resolutionTargetRequirementsSchema.safeParse([
      { kind: 'condition', presence: 'has', ids: ['prone'] },
      { kind: 'any-of', conditionIds: ['grappled'] },
    ])
    expect(conditionAndAnyOf.success).toBe(false)
  })

  it('requires a clause with whitespace, and at least one any-of side', () => {
    expect(
      resolutionTargetRequirementsSchema.safeParse([{ kind: 'written', text: 'demon' }]).success,
    ).toBe(false)
    expect(
      resolutionTargetRequirementsSchema.safeParse([{ kind: 'written', text: 'that is a demon' }])
        .success,
    ).toBe(true)
    expect(resolutionTargetRequirementsSchema.safeParse([{ kind: 'any-of' }]).success).toBe(false)
    expect(
      resolutionTargetRequirementsSchema.safeParse([
        {
          kind: 'any-of',
          willing: true,
          conditionIds: ['grappled', 'incapacitated', 'restrained'],
        },
      ]).success,
    ).toBe(true)
  })

  it('keeps incompatible requirements in data but rejects them for object or either targets', () => {
    const parsed = target([{ kind: 'size', bound: 'large', comparison: 'or-smaller' }], 'object')
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toContain(
        'Creature size only applies to creatures. Select Creature targeting or remove this requirement.',
      )
      expect(parsed.error.issues.some((issue) => issue.path.join('.') === 'requirements.0')).toBe(
        true,
      )
    }

    expect(
      target(
        [
          { kind: 'sight', who: 'actor' },
          { kind: 'written', text: 'that is flammable' },
        ],
        'object',
      ).success,
    ).toBe(true)
    expect(target([{ kind: 'willing' }], 'creature-or-object').success).toBe(false)
    expect(target([{ kind: 'sight', who: 'target' }], 'creature-or-object').success).toBe(false)
    expect(target([{ kind: 'sight', who: 'actor' }], 'creature-or-object').success).toBe(true)
  })
})
