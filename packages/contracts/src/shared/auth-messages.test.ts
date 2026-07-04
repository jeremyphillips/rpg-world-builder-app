import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../validation/define-message'
import { authValidationMessages } from './auth-messages'

describe('authValidationMessages', () => {
  it('formats password length policy copy', () => {
    expect(formatFieldMessage(authValidationMessages.passwordMinLength({ min: 8 }))).toBe(
      'Password must be at least 8 characters.',
    )
    expect(formatFieldMessage(authValidationMessages.passwordMaxLength({ max: 128 }))).toBe(
      'Password cannot exceed 128 characters.',
    )
  })
})
