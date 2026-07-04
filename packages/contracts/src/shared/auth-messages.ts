import { defineMessage } from '../validation/define-message'

// ---------------------------------------------------------------------------
// Auth validation messages (tier 2).
// ---------------------------------------------------------------------------

export const authValidationMessages = {
  passwordMinLength: defineMessage<{ min: number }>(
    'validation.auth.passwordMinLength',
    ({ min }) => `Password must be at least ${min} characters.`,
  ),
  passwordMaxLength: defineMessage<{ max: number }>(
    'validation.auth.passwordMaxLength',
    ({ max }) => `Password cannot exceed ${max} characters.`,
  ),
}
