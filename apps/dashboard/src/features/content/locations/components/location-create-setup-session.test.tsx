import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SETTLEMENT_CREATE_SETUP_PROMPT } from '../lib/location-settlement-create-setup.lib'
import { LocationCreateSetupSession } from './location-create-setup-session.client'

describe('LocationCreateSetupSession', () => {
  it('passes additionalContinueConstraint from the shared setup model', async () => {
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

  it('keeps single-choice setup expanded without summary chrome after selection', async () => {
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
      screen.getByRole('radiogroup', { name: SETTLEMENT_CREATE_SETUP_PROMPT }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
  })
})
