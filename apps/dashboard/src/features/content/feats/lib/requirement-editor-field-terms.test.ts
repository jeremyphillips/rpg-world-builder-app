import { formatFieldMessage } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  requirementConditionTypeLabel,
  requirementConditionTypeRequiredSelectMessage,
} from './requirement-editor-field-terms'

describe('requirement-editor-field-terms', () => {
  it('derives the field label and required select message from the vocab term', () => {
    expect(requirementConditionTypeLabel).toBe('Condition type')
    expect(formatFieldMessage(requirementConditionTypeRequiredSelectMessage())).toBe(
      'Select condition type.',
    )
  })
})
