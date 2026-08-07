/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CampaignDisplayName } from './campaign-display-name'
import { CampaignDisplayNameList } from './campaign-display-name-list.client'

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

  itAxe('has no axe accessibility violations for linked state', async () => {
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

describe('CampaignDisplayNameList', () => {
  it('renders one icon with comma-separated linked campaign names', () => {
    render(
      <MemoryRouter>
        <CampaignDisplayNameList
          surface="inlineMuted"
          displays={[
            { id: 'camp_1', name: 'Curse of Strahd', imageUrl: null },
            { id: 'camp_2', name: 'Lost Mine', imageUrl: null },
          ]}
          getHref={(display) => `/campaigns/${display.id}`}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Curse of Strahd' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1',
    )
    expect(screen.getByRole('link', { name: 'Lost Mine' })).toHaveAttribute(
      'href',
      '/campaigns/camp_2',
    )
  })
})
