import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { expectFieldsInvalid, fillSignupFields } from './auth-test-utils'

const { register, login } = vi.hoisted(() => ({ register: vi.fn(), login: vi.fn() }))

vi.mock('../api/auth-client', () => ({
  register,
  login,
  ApiError: class ApiError extends Error {
    status = 0
    code = 'error'
  },
}))

import { SignupForm } from './signup-form'

describe('SignupForm', () => {
  beforeEach(() => {
    register.mockReset()
    login.mockReset()
  })

  it('validates all fields and does not call the API for invalid input', async () => {
    render(<SignupForm onSuccess={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await expectFieldsInvalid(/display name/i, /email/i, /password/i)
    expect(register).not.toHaveBeenCalled()
  })

  it('rejects a too-short password', async () => {
    render(<SignupForm onSuccess={vi.fn()} />)

    await fillSignupFields('Game Master', 'dm@example.com', 'short')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await expectFieldsInvalid(/password/i)
    expect(register).not.toHaveBeenCalled()
  })

  it('registers, logs in, and invokes onSuccess for valid input', async () => {
    register.mockResolvedValueOnce({ user: { id: '1' } })
    login.mockResolvedValueOnce({ user: { id: '1' } })
    const onSuccess = vi.fn()
    render(<SignupForm onSuccess={onSuccess} />)

    await fillSignupFields('Game Master', 'dm@example.com', 'supersecret')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        displayName: 'Game Master',
        email: 'dm@example.com',
        password: 'supersecret',
      })
    })
    await waitFor(() => expect(login).toHaveBeenCalledOnce())
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })
})
