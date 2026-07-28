import { describe, expect, it } from 'vitest'

import { characterBuildValidationIssueSchema } from './validation-issue'

describe('characterBuildValidationIssueSchema', () => {
  it('parses an issue with no reference target', () => {
    expect(
      characterBuildValidationIssueSchema.parse({
        code: 'required',
        message: 'Name is required.',
      }),
    ).toEqual({
      code: 'required',
      message: 'Name is required.',
    })
  })

  it('parses an issue with stepId only', () => {
    expect(
      characterBuildValidationIssueSchema.parse({
        code: 'required',
        message: 'Species is required.',
        stepId: 'species',
      }),
    ).toEqual({
      code: 'required',
      message: 'Species is required.',
      stepId: 'species',
    })
  })

  it('parses an issue with choiceSetId only', () => {
    expect(
      characterBuildValidationIssueSchema.parse({
        code: 'choice_unresolved',
        message: 'Resolve the class choice.',
        choiceSetId: 'class-choice',
      }),
    ).toEqual({
      code: 'choice_unresolved',
      message: 'Resolve the class choice.',
      choiceSetId: 'class-choice',
    })
  })

  it('parses an issue with allowanceId only', () => {
    expect(
      characterBuildValidationIssueSchema.parse({
        code: 'allowance_exceeded',
        message: 'Too many selections.',
        allowanceId: 'skill-proficiencies',
      }),
    ).toEqual({
      code: 'allowance_exceeded',
      message: 'Too many selections.',
      allowanceId: 'skill-proficiencies',
    })
  })

  it('rejects issues with more than one reference target', () => {
    const result = characterBuildValidationIssueSchema.safeParse({
      code: 'invalid',
      message: 'Conflicting targets.',
      stepId: 'species',
      choiceSetId: 'species-choice',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('only one target'))).toBe(
        true,
      )
    }
  })
})
