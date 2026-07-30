/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignDisplayName } from './campaign-display-name'

describe('CampaignDisplayName', () => {
  it('renders a linked topbar identity', () => {
    render(
      <MemoryRouter>
        <CampaignDisplayName
          display={{ id: 'camp_1', name: 'The Argent Road', imageUrl: null }}
          surface="topbar"
          href="/campaigns/camp_1"
          asLink
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'The Argent Road' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1',
    )
  })

  it('renders page headings as h1', () => {
    render(
      <CampaignDisplayName
        display={{ id: 'camp_1', name: 'The Argent Road', imageUrl: null }}
        surface="page"
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'The Argent Road' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations for linked state', async () => {
    const { container } = render(
      <MemoryRouter>
        <CampaignDisplayName
          display={{ id: 'camp_1', name: 'The Argent Road', imageUrl: null }}
          surface="topbar"
          href="/campaigns/camp_1"
          asLink
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
