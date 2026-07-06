import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../validation/define-message'
import { characterBuilderPreviewMessages } from './character-builder-preview-messages'

describe('characterBuilderPreviewMessages', () => {
  it('uses the characterBuilderPreview scope for every id', () => {
    for (const message of Object.values(characterBuilderPreviewMessages)) {
      expect(message.id).toMatch(/^validation\.characterBuilderPreview\./)
    }
  })

  it('formats advisory preview copy', () => {
    expect(formatFieldMessage(characterBuilderPreviewMessages.nameNotSet())).toBe(
      'Name is not set.',
    )
    expect(formatFieldMessage(characterBuilderPreviewMessages.requiredChoicesIncomplete())).toBe(
      'Some required choices are incomplete.',
    )
  })
})
