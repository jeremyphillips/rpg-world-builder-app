import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SETTLEMENT_CREATE_SETUP_PROMPT } from '../../../lib/create/setup/location-settlement-create-setup.lib'
import { LocationCreateSetupSession } from './location-create-setup-session'

describe('LocationCreateSetupSession', () => {
  it('requires explicit Continue confirmation after selection', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <LocationCreateSetupSession
        open
        intent={{ authoringType: 'settlement' }}
        onOpenChange={onOpenChange}
        onComplete={onComplete}
      />,
    )

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Town') }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({ kind: 'settlement', settlementType: 'town' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('summarizes the completed choice without an active control after selection', async () => {
    const user = userEvent.setup()

    render(
      <LocationCreateSetupSession
        open
        intent={{ authoringType: 'settlement' }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('City') }))

    expect(
      screen.queryByRole('radiogroup', { name: SETTLEMENT_CREATE_SETUP_PROMPT }),
    ).not.toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
})
