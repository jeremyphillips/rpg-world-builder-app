import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../../validation/define-message'
import { characterBuilderStepSelectionMessages } from './character-builder-step-selection-messages'

describe('characterBuilderStepSelectionMessages', () => {
  it('defines stable message ids', () => {
    for (const message of Object.values(characterBuilderStepSelectionMessages)) {
      expect(message.id).toMatch(/^validation\.characterBuilder\.stepSelection\./)
    }
  })

  it('formats species and class selection affordances', () => {
    expect(formatFieldMessage(characterBuilderStepSelectionMessages.selectSpecies())).toBe(
      'Select species',
    )
    expect(formatFieldMessage(characterBuilderStepSelectionMessages.selectClass())).toBe(
      'Select class',
    )
    expect(formatFieldMessage(characterBuilderStepSelectionMessages.selectedBadge())).toBe(
      'Selected',
    )
  })
})
