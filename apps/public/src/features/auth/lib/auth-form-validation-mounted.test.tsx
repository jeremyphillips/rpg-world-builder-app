/**
 * @vitest-environment jsdom
 *
 * Mounted login/signup surfaces: useAuthFormSubmit + runFormAction invalid submit and a11y.
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { Form } from '@rpg/ui/form'
import {
  loginInputSchema,
  registerInputSchema,
  type LoginInput,
  type RegisterInput,
} from '@rpg/contracts'

import { loginFields, signupFields } from './auth-form-fields'
import { useAuthFormSubmit } from './use-auth-form-submit.client'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('auth form validation mounted submit', () => {
  it('blocks persist and surfaces accessible field errors on login', async () => {
    const user = userEvent.setup()
    const submit = vi.fn()

    function LoginHarness() {
      const { onSubmit, formError } = useAuthFormSubmit<LoginInput>({
        schema: loginInputSchema,
        fields: loginFields,
        fallbackMessage: 'Unable to log in.',
        submit,
      })

      return (
        <Form
          id="login-mounted"
          schema={loginInputSchema}
          fields={loginFields}
          defaultValues={{ email: '', password: '' }}
          onSubmit={onSubmit}
          formError={formError ?? undefined}
          footer={<button type="submit">Log in</button>}
        />
      )
    }

    render(<LoginHarness />)
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(submit).not.toHaveBeenCalled()
    })

    const email = screen.getByRole('textbox', { name: /email/i })
    expect(email).toHaveAttribute('aria-invalid', 'true')
    const describedBy = email.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
  })

  it('blocks persist on signup through runFormAction before dispatch', async () => {
    const user = userEvent.setup()
    const submit = vi.fn()

    function SignupHarness() {
      const { onSubmit, formError } = useAuthFormSubmit<RegisterInput>({
        schema: registerInputSchema,
        fields: signupFields,
        fallbackMessage: 'Unable to sign up.',
        submit,
      })

      return (
        <Form
          id="signup-mounted"
          schema={registerInputSchema}
          fields={signupFields}
          defaultValues={{ displayName: '', email: 'bad', password: 'short' }}
          onSubmit={onSubmit}
          formError={formError ?? undefined}
          footer={<button type="submit">Sign up</button>}
        />
      )
    }

    render(<SignupHarness />)
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(() => {
      expect(submit).not.toHaveBeenCalled()
    })
  })
})
