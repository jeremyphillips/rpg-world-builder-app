import { describe, expect, it } from 'vitest'

import { characterBuilderValidationMessages } from './character-builder-messages'

describe('characterBuilderValidationMessages', () => {
  it('formats step incomplete copy', () => {
    expect(characterBuilderValidationMessages.stepIncomplete()).toContain(
      'Complete this step before continuing.',
    )
    expect(characterBuilderValidationMessages.stepIncomplete.id).toBe(
      'validation.characterBuilder.stepIncomplete',
    )
  })

  it('formats standard array assignment copy', () => {
    expect(characterBuilderValidationMessages.standardArrayExactAssignment()).toContain(
      'Assign each standard array value to exactly one ability.',
    )
    expect(characterBuilderValidationMessages.standardArrayExactAssignment.id).toBe(
      'validation.characterBuilder.standardArrayExactAssignment',
    )
  })

  it('uses the characterBuilder scope for every id', () => {
    for (const message of Object.values(characterBuilderValidationMessages)) {
      expect(message.id).toMatch(/^validation\.characterBuilder\./)
    }
  })
})
