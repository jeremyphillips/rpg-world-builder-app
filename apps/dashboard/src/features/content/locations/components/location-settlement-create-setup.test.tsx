import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { HARBORFORD } from '../fixtures'
import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  SETTLEMENT_CREATE_SETUP_HEADLINE,
  SETTLEMENT_CREATE_SETUP_PROMPT,
} from '../lib/location-settlement-create-setup.lib'
import { LocationSettlementCreateSetup } from './location-settlement-create-setup.client'

describe('LocationSettlementCreateSetup', () => {
  it('renders canonical settlement options with kind-oriented prompt', () => {
    render(
      <LocationSettlementCreateSetup
        open
        intent={{ authoringType: 'settlement' }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: SETTLEMENT_CREATE_SETUP_HEADLINE }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radiogroup', { name: SETTLEMENT_CREATE_SETUP_PROMPT }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: (name) => name.startsWith('City') }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: (name) => name.startsWith('Hamlet') }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('shows overview parent copy when intent has no fixed parent', () => {
    render(
      <LocationSettlementCreateSetup
        open
        intent={{ authoringType: 'settlement' }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    expect(screen.getByText(/parent on the next screen/i)).toBeInTheDocument()
  })

  it('omits parent chooser copy for contained intents', () => {
    render(
      <LocationSettlementCreateSetup
        open
        intent={{ authoringType: 'settlement', parentLocationId: HARBORFORD.id }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    expect(screen.queryByText(/parent on the next screen/i)).not.toBeInTheDocument()
  })

  it('keeps the terminal choice set expanded after selection and completes on Continue', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <LocationSettlementCreateSetup
        open
        intent={{ authoringType: 'settlement' }}
        onOpenChange={vi.fn()}
        onComplete={onComplete}
      />,
    )

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('City') }))

    expect(
      screen.getByRole('radiogroup', { name: SETTLEMENT_CREATE_SETUP_PROMPT }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({ kind: 'settlement', settlementType: 'city' })
    })
  })
})
