import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { expectFieldsInvalid, fillEmailAndPassword } from './auth-test-utils'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('../api/auth-client', () => ({
  login,
  register: vi.fn(),
  ApiError: class ApiError extends Error {
    status = 0
    code = 'error'
  },
}))

import { LoginForm } from './login-form'

describe('LoginForm', () => {
  beforeEach(() => {
    login.mockReset()
  })

  it('shows validation errors and does not call the API for invalid input', async () => {
    const onSuccess = vi.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await expectFieldsInvalid(/email/i, /password/i)
    expect(login).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('submits valid credentials and invokes onSuccess', async () => {
    login.mockResolvedValueOnce({ user: { id: '1' } })
    const onSuccess = vi.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    await fillEmailAndPassword('dm@example.com', 'supersecret')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'dm@example.com', password: 'supersecret' })
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
  })

  it('surfaces a form-level error when the API rejects', async () => {
    login.mockRejectedValueOnce(
      Object.assign(new Error('Invalid email or password'), { name: 'ApiError' }),
    )
    render(<LoginForm onSuccess={vi.fn()} />)

    await fillEmailAndPassword('dm@example.com', 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
