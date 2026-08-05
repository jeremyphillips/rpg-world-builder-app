import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ContentEntityCard, ContentEntityCardViewLink } from './content-entity-card.client'

describe('ContentEntityCard', () => {
  it('wraps the heading in a link when href is provided', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          heading="Harbor District"
          href="/campaigns/camp-1/locations/harbor"
          subheading="Settlement overview"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/locations/harbor',
    )
    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveClass('text-link')
    expect(screen.getByRole('link', { name: 'Harbor District' })).not.toHaveClass('hover:underline')
    expect(screen.getByText('Settlement overview')).toBeInTheDocument()
  })

  it('renders artwork from imageKey via ContentCardMedia', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard heading="Silver Circle" imageKey="org/silver-circle.png" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('img', { name: 'Silver Circle' })).toBeInTheDocument()
  })

  it('renders a compact heading-end view link', () => {
    render(
      <MemoryRouter>
        <ContentEntityCardViewLink href="/campaigns/camp-1/characters/char-1" />
      </MemoryRouter>,
    )

    const viewLink = screen.getByRole('link', { name: 'View' })
    expect(viewLink).toHaveAttribute('href', '/campaigns/camp-1/characters/char-1')
    expect(viewLink).toHaveClass('text-sm')
    expect(viewLink).toHaveClass('pr-0')
    expect(viewLink).toHaveClass('h-control-action-compact')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard
          heading="Harbor District"
          href="/campaigns/camp-1/locations/harbor"
          subheading="Settlement overview"
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
