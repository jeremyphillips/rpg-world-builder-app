import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../validation/define-message'
import {
  characterBuilderDependentChoiceMessages,
  DEPENDENT_CHOICE_KINDS,
} from './character-builder-dependent-choice-messages'

describe('characterBuilderDependentChoiceMessages', () => {
  it('uses the dependentChoice scope for every id', () => {
    for (const message of Object.values(characterBuilderDependentChoiceMessages)) {
      expect(message.id).toMatch(/^validation\.characterBuilder\.dependentChoice\./)
    }
  })

  it('formats heritage dependent-choice copy', () => {
    expect(formatFieldMessage(characterBuilderDependentChoiceMessages.requiredStatus())).toBe(
      'Required',
    )
    expect(formatFieldMessage(characterBuilderDependentChoiceMessages.helperText())).toBe(
      'Choose one option.',
    )
    expect(formatFieldMessage(characterBuilderDependentChoiceMessages.manageHeritage())).toBe(
      'Manage heritage',
    )
    expect(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.parentChoiceRequired({
          kind: DEPENDENT_CHOICE_KINDS.heritage,
        }),
      ),
    ).toBe('Heritage required')
    expect(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.parentChoiceSelected({
          selectedOptionLabel: 'Drow',
          kind: DEPENDENT_CHOICE_KINDS.heritage,
        }),
      ),
    ).toBe('Drow heritage')
    expect(
      formatFieldMessage(
        characterBuilderDependentChoiceMessages.optionSelected({ selectedOptionLabel: 'Drow' }),
      ),
    ).toBe('Drow selected')
  })
})
