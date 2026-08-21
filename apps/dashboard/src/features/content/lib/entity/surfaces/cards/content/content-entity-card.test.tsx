import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { buildEntityMediaFromImageKey } from '../../../summary/entity-media.lib'
import { HARBOR_DISTRICT_ENTITY } from '../../../entity.fixture'
import { CatalogEntityPickerSheet } from '../../catalog/catalog-entity-picker-sheet'
import { createCatalogEntityRowRenderer } from '../../catalog/catalog-entity-row-renderer'
import { ContentEntityCard, ContentEntityCardViewLink } from './content-entity-card'

describe('ContentEntityCard', () => {
  it('wraps the heading in a link when headingHref is provided', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          headingHref="/campaigns/camp-1/locations/harbor"
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

  it('uses symmetric surface inset when no leading utility is present', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard entity={HARBOR_DISTRICT_ENTITY} density="compact" />
      </MemoryRouter>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('bg-card')
    expect(article).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*3)]')
    expect(article).toHaveClass('[--entity-surface-inline-end:calc(var(--spacing)*3)]')
  })

  it('reduces start inset when a leading utility is present', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          leading={<span aria-hidden>Grip</span>}
        />
      </MemoryRouter>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*1)]')
    expect(article).toHaveClass('[--entity-surface-inline-end:calc(var(--spacing)*3)]')
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

  it('renders trailing action in the standard card slot', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          trailing={{ kind: 'action', content: <button type="button">Select</button> }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('renders headingEndValue when provided, including zero', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard entity={{ heading: 'Strength' }} headingEndValue={0} density="compact" />
      </MemoryRouter>,
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Strength')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard
          entity={HARBOR_DISTRICT_ENTITY}
          headingHref="/campaigns/camp-1/locations/harbor"
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})

describe('CatalogEntityPickerSheet', () => {
  it('embeds flat entity rows with host-owned inset via CatalogEntityRow', () => {
    render(
      <CatalogEntityPickerSheet
        open
        onOpenChange={() => undefined}
        title="Locations"
        items={[{ id: 'loc-1', name: 'Grey Coast', kind: 'Region' }]}
        getItemKey={(item) => item.id}
        getSearchText={(item) => item.name}
        renderEntityRow={createCatalogEntityRowRenderer({
          buildEntity: (item) => ({ heading: item.name, classification: item.kind }),
          buildTrailing: () => ({
            kind: 'action',
            content: <button type="button">Select</button>,
          }),
        })}
      />,
    )

    const rowShell = screen.getByRole('group')
    expect(rowShell).toHaveClass('p-0')
    expect(rowShell).not.toHaveClass('pl-2')
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
    expect(screen.getByText('Grey Coast')).toBeInTheDocument()
  })
})
