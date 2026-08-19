import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import {
  SITE_CREATE_SETUP_HEADLINE,
  SITE_CREATE_SETUP_PROMPT,
} from '../lib/location-site-create-setup.lib'
import { LocationSiteCreateSetup } from './location-site-create-setup.client'

describe('LocationSiteCreateSetup', () => {
  it('renders canonical site options with kind-oriented prompt', () => {
    render(
      <LocationSiteCreateSetup
        open
        intent={{ authoringType: 'site' }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: SITE_CREATE_SETUP_HEADLINE })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: SITE_CREATE_SETUP_PROMPT })).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: (name) => name.startsWith('Landmark') }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('keeps the terminal choice set expanded after selection and completes on Continue', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <LocationSiteCreateSetup
        open
        intent={{ authoringType: 'site' }}
        onOpenChange={onOpenChange}
        onComplete={onComplete}
      />,
    )

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Landmark') }))

    expect(screen.getByRole('radiogroup', { name: SITE_CREATE_SETUP_PROMPT })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: LOCATION_CREATE_SETUP_CHANGE_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({ kind: 'site', siteType: 'landmark' })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
