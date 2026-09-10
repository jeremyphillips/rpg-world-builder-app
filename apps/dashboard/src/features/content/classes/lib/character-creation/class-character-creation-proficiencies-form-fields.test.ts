import { describe, expect, it } from 'vitest'

import { refineCharacterCreationSaveValidation } from './class-character-creation-form-validation'

describe('characterCreationSkillChoice publish validation', () => {
  it('requires the skill pool to be at least as large as the choose count on publish', () => {
    const issues: Array<{ path: (string | number)[]; message: string }> = []
    refineCharacterCreationSaveValidation(
      {
        proficiencies: {
          skills: { choose: 2, from: ['acrobatics'] },
          tools: { choose: 0, poolSource: 'filtered', poolToolCategories: [] },
        },
      },
      {
        addIssue: (issue: { path: (string | number)[]; message: string }) => {
          issues.push({ path: issue.path, message: issue.message })
        },
      } as never,
    )

    expect(issues).toEqual([
      expect.objectContaining({
        path: ['proficiencies', 'skills', 'from'],
        message: 'Add at least 2 skills to the pool',
      }),
    ])
  })

  it('accepts a pool that matches the choose count', () => {
    const issues: unknown[] = []
    refineCharacterCreationSaveValidation(
      {
        proficiencies: {
          skills: { choose: 2, from: ['acrobatics', 'athletics'] },
          tools: { choose: 0, poolSource: 'filtered', poolToolCategories: [] },
        },
      },
      {
        addIssue: (issue: unknown) => {
          issues.push(issue)
        },
      } as never,
    )

    expect(issues).toEqual([])
  })
})
