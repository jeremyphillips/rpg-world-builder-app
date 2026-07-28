import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../../validation/define-message'

import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { mapCreateInputZodIssueMessage } from './finalize-zod-issue-messages'

describe('mapCreateInputZodIssueMessage', () => {
  it('maps known create-input paths to builder validation copy', () => {
    expect(mapCreateInputZodIssueMessage('name', 'too_small')).toBe(
      formatFieldMessage(characterBuilderValidationMessages.nameRequired()),
    )
    expect(mapCreateInputZodIssueMessage('alignment', 'invalid_type')).toBe(
      formatFieldMessage(characterBuilderValidationMessages.alignmentRequired()),
    )
    expect(mapCreateInputZodIssueMessage('species.id', 'invalid_type')).toBe(
      formatFieldMessage(characterBuilderValidationMessages.speciesRequired()),
    )
    expect(mapCreateInputZodIssueMessage('classes.0.classId', 'invalid_type')).toBe(
      formatFieldMessage(characterBuilderValidationMessages.classRequired()),
    )
    expect(mapCreateInputZodIssueMessage('abilityScores.str', 'invalid_type')).toBe(
      formatFieldMessage(characterBuilderValidationMessages.abilitiesIncomplete()),
    )
  })

  it('returns undefined for unmapped paths', () => {
    expect(mapCreateInputZodIssueMessage('narrative.backstory', 'too_big')).toBeUndefined()
  })
})
