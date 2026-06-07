import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

/** Waits for the first field to become invalid, then synchronously checks the rest. */
export async function expectFieldsInvalid(first: RegExp, ...rest: RegExp[]) {
  await waitFor(() => {
    expect(screen.getByLabelText(first)).toHaveAttribute('aria-invalid', 'true')
  })
  for (const label of rest) {
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true')
  }
}

/** Type into the email and password fields. */
export async function fillEmailAndPassword(email: string, password: string) {
  await userEvent.type(screen.getByLabelText(/email/i), email)
  await userEvent.type(screen.getByLabelText(/password/i), password)
}

/** Type into all three signup fields. */
export async function fillSignupFields(displayName: string, email: string, password: string) {
  await userEvent.type(screen.getByLabelText(/display name/i), displayName)
  await userEvent.type(screen.getByLabelText(/email/i), email)
  await userEvent.type(screen.getByLabelText(/password/i), password)
}
