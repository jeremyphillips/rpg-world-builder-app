import { describe, it } from 'vitest'
import {
  assertInvalidSubmitUsesRefinedMessages,
  assertRegistryCoverage,
} from '@rpg/ui/form/test-utils'

import { loginFields, loginFormSchema, signupFields, signupFormSchema } from './auth-form-fields'

describe('auth form validation', () => {
  it('login form', () => {
    assertRegistryCoverage(loginFormSchema, loginFields)
    assertInvalidSubmitUsesRefinedMessages(loginFormSchema, loginFields)
  })

  it('signup form', () => {
    assertRegistryCoverage(signupFormSchema, signupFields)
    assertInvalidSubmitUsesRefinedMessages(signupFormSchema, signupFields, {
      invalidValue: { displayName: '', email: 'bad', password: 'short' },
    })
  })
})
