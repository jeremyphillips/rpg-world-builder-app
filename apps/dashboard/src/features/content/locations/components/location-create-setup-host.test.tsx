import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SETTLEMENT_CREATE_SETUP_HEADLINE } from '../lib/create/setup/location-settlement-create-setup.lib'
import { LocationCreateSetupHost } from './location-create-setup-host.client'

describe('LocationCreateSetupHost', () => {
  it('renders the shared setup session for setup-gated authoring types', () => {
    render(
      <LocationCreateSetupHost
        intent={{ authoringType: 'settlement' }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: SETTLEMENT_CREATE_SETUP_HEADLINE }),
    ).toBeInTheDocument()
  })

  it('throws for authoring types that bypass create setup', () => {
    expect(() =>
      render(
        <LocationCreateSetupHost
          intent={{ authoringType: 'district' }}
          onOpenChange={vi.fn()}
          onComplete={vi.fn()}
        />,
      ),
    ).toThrow(/LocationCreateSetupHost requires a setup-gated authoring type/)
  })
})
