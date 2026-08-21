/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { CAMPAIGNS_OVERVIEW_COPY } from '../lib/overview/campaigns-overview-copy'
import { NewCampaignLink } from './new-campaign-link'

describe('NewCampaignLink', () => {
  it('renders the create route with the requested button variant and size', () => {
    const { rerender } = render(
      <MemoryRouter>
        <NewCampaignLink variant="default" size="sm" />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel })
    expect(link).toHaveAttribute('href', '/campaigns/new')
    expect(link).toHaveClass('h-8')
    expect(link).not.toHaveClass('border-interactive-outline')

    rerender(
      <MemoryRouter>
        <NewCampaignLink variant="outline" size="sm" />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveClass('border-interactive-outline')
  })
})
