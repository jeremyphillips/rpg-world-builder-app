import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

  it('omits the modal subhead by default', () => {
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
    expect(screen.queryByText(/parent on the next screen/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/before authoring/i)).not.toBeInTheDocument()
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
