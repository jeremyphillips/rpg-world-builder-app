import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { ButtonLink } from '@rpg/ui'

import { IndexPageEmptyState, IndexPageIntro } from './index-page-intro'

describe('IndexPageIntro', () => {
  it('renders actions in the header when requested', () => {
    render(
      <MemoryRouter>
        <IndexPageIntro
          title="Campaigns"
          description="Create and manage shared game worlds."
          showActionsInHeader
          actions={<ButtonLink link={<Link to="/campaigns/new" />}>New campaign</ButtonLink>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Campaigns' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New campaign' })).toBeInTheDocument()
  })

  it('omits header actions when showActionsInHeader is false', () => {
    render(
      <MemoryRouter>
        <IndexPageIntro
          title="Campaigns"
          description="Create and manage shared game worlds."
          actions={<ButtonLink link={<Link to="/campaigns/new" />}>New campaign</ButtonLink>}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'New campaign' })).not.toBeInTheDocument()
  })
})

describe('IndexPageEmptyState', () => {
  it('renders empty copy below the intro with actions underneath', () => {
    render(
      <MemoryRouter>
        <IndexPageEmptyState
          heading="You have not created or joined a campaign yet."
          body="Create one to invite players, organize sessions, and manage campaign content."
          actions={<ButtonLink link={<Link to="/campaigns/new" />}>New campaign</ButtonLink>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('You have not created or joined a campaign yet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New campaign' })).toBeInTheDocument()
  })
})
