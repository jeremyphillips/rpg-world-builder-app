import { describe, expect, it } from 'vitest'

import { characterCreationSkillChoiceFormSchema } from './class-character-creation-proficiencies-form-fields'

describe('characterCreationSkillChoiceFormSchema', () => {
  it('requires the skill pool to be at least as large as the choose count', () => {
    const result = characterCreationSkillChoiceFormSchema.safeParse({
      choose: 2,
      from: ['acrobatics'],
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.error.issues).toEqual([
      expect.objectContaining({
        path: ['from'],
        message: 'Add at least 2 skills to the pool',
      }),
    ])
  })

  it('accepts a pool that matches the choose count', () => {
    const result = characterCreationSkillChoiceFormSchema.safeParse({
      choose: 2,
      from: ['acrobatics', 'athletics'],
    })

    expect(result.success).toBe(true)
  })
})
