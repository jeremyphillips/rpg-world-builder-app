import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'

import { renderWithDataRouter } from '@/lib/test-router'
import { makeTestQueryClient } from '@/test/render'

vi.mock('@/features/user/api/user-client')

import { changePassword as changePasswordFn } from '@/features/user/api/user-client'
import { ChangePasswordSection } from './change-password-section'

const changePassword = vi.mocked(changePasswordFn)

function renderSection() {
  const queryClient = makeTestQueryClient()
  return renderWithDataRouter([
    {
      path: '/',
      element: (
        <QueryClientProvider client={queryClient}>
          <ChangePasswordSection />
        </QueryClientProvider>
      ),
    },
  ])
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  { current = 'OldPass12', next = 'NewPass12', confirm = 'NewPass12' } = {},
) {
  await user.type(screen.getByLabelText('Current password'), current)
  await user.type(screen.getByLabelText('New password'), next)
  await user.type(screen.getByLabelText('Confirm new password'), confirm)
}

describe('ChangePasswordSection', () => {
  beforeEach(() => {
    changePassword.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders all three password fields', () => {
    renderSection()
    expect(screen.getByLabelText('Current password')).toBeInTheDocument()
    expect(screen.getByLabelText('New password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument()
  })

  it('shows a validation error when the passwords do not match', async () => {
    const user = userEvent.setup()
    renderSection()
    await fillForm(user, { confirm: 'DifferentPass' })
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
    expect(changePassword).not.toHaveBeenCalled()
  })

  it('calls changePassword without confirmNewPassword on a valid submit', async () => {
    const user = userEvent.setup()
    changePassword.mockResolvedValue(undefined)
    renderSection()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Change password' }))

    await waitFor(() => expect(changePassword).toHaveBeenCalledTimes(1))
    expect(changePassword.mock.lastCall?.[0]).toEqual({
      currentPassword: 'OldPass12',
      newPassword: 'NewPass12',
    })
    expect(changePassword.mock.lastCall?.[0]).not.toHaveProperty('confirmNewPassword')
  })

  it('shows a success message after the password is changed', async () => {
    const user = userEvent.setup()
    changePassword.mockResolvedValue(undefined)
    renderSection()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByText('Password changed.')).toBeInTheDocument()
  })

  it('shows the API error message when the current password is wrong', async () => {
    const user = userEvent.setup()
    changePassword.mockRejectedValue(new Error('Current password is incorrect'))
    renderSection()

    await fillForm(user)
    await user.click(screen.getByRole('button', { name: 'Change password' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderSection()
    await expectNoAxeViolations(container)
  })
})
