import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'

import { AllCampaignsLink } from './all-campaigns-link'

describe('AllCampaignsLink', () => {
  it('renders a muted nav-style link with a chevron icon', () => {
    render(
      <MemoryRouter>
        <AllCampaignsLink />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'All campaigns' })
    expect(link).toHaveAttribute('href', ROUTES.campaign.list)
    expect(link).toHaveClass('text-muted-foreground', 'hover:text-accent-foreground')
    expect(link.querySelector('[aria-hidden="true"]')).toHaveClass('size-4.5', 'shrink-0')
  })
})
