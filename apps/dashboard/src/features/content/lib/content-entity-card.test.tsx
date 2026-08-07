import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CatalogPickerSheet } from '@rpg/ui'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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

  it('allows href in embedded chrome', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          chrome="embedded"
          density="compact"
          heading="Harbor District"
          href="/campaigns/camp-1/locations/harbor"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/locations/harbor',
    )
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

  it('applies presentational disabled treatment only', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard
          chrome="embedded"
          density="compact"
          heading="Port City"
          subheading="All site relationship types already linked."
          disabled
        />
      </MemoryRouter>,
    )

    const article = container.querySelector('article')
    expect(article).toHaveAttribute('data-disabled', 'true')
    expect(article).toHaveClass('opacity-60')
  })

  it('renders endSlot in the standard card slot', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          chrome="embedded"
          density="compact"
          heading="Grey Coast"
          endSlot={<button type="button">Select</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('embeds in entity-card picker rows without double-applying host content inset', () => {
    render(
      <CatalogPickerSheet
        open
        onOpenChange={() => undefined}
        title="Locations"
        rowPreset="catalog"
        rowLayout="entity-card"
        items={[{ id: 'loc-1', name: 'Grey Coast', kind: 'Region' }]}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.name}
        renderItemHeader={(item) => (
          <ContentEntityCard
            chrome="embedded"
            density="compact"
            heading={item.name}
            subheading={item.kind}
            endSlot={<button type="button">Select</button>}
          />
        )}
      />,
    )

    const rowShell = screen.getByRole('group')
    expect(rowShell).toHaveClass('p-0')
    expect(rowShell).not.toHaveClass('pl-2')
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
    expect(screen.getByText('Grey Coast')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
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
