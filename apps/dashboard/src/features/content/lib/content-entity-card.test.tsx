import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CatalogPickerSheet } from '@rpg/ui'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { buildEntityMediaFromImageKey } from './entity/entity-media.lib'
import { HARBOR_DISTRICT_ENTITY } from './entity/entity.fixture'
import {
  ContentEntityCard,
  ContentEntityCardViewLink,
  EntityItem,
} from './content-entity-card.client'

describe('ContentEntityCard', () => {
  it('wraps the heading in a link when href is provided', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          href="/campaigns/camp-1/locations/harbor"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveAttribute(
      'href',
      '/campaigns/camp-1/locations/harbor',
    )
    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveClass('text-link')
    expect(screen.getByRole('link', { name: 'Harbor District' })).not.toHaveClass('hover:underline')
    expect(screen.getByText('Located in Grey Coast')).toBeInTheDocument()
  })

  it('renders artwork from entity media', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          entity={{
            heading: 'Silver Circle',
            media: buildEntityMediaFromImageKey('org/silver-circle.png', 'Silver Circle'),
          }}
        />
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
        <ContentEntityCard entity={HARBOR_DISTRICT_ENTITY} disabled />
      </MemoryRouter>,
    )

    const article = container.querySelector('article')
    expect(article).toHaveAttribute('data-disabled', 'true')
    expect(article).toHaveClass('opacity-60')
  })

  it('renders action in the standard card slot', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          action={<button type="button">Select</button>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          href="/campaigns/camp-1/locations/harbor"
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})

describe('EntityItem', () => {
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
          <EntityItem
            density="compact"
            entity={{ heading: item.name, classification: item.kind }}
            action={<button type="button">Select</button>}
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
})
