import { render, screen } from '@testing-library/react'
import {
  CollapsibleListItem,
  collapsibleListItemBodyFrameClasses,
  collapsibleListItemHeaderVerticalPaddingVariants,
} from '@rpg/ui'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { HARBOR_DISTRICT_ENTITY } from '../../__tests__/entity.fixture'
import { CatalogEntityRow } from '../catalog/catalog-entity-row'
import { catalogEntityRowHeaderPaddingVariants } from '../catalog/catalog-entity-row.variants'
import { DisclosureEntityCard } from '../cards/disclosure/disclosure-entity-card'
import { disclosureEntityCardHeaderPaddingVariants } from '../cards/disclosure/disclosure-entity-card.variants'

const compactHeaderRhythm = collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' })

const catalogDomIds = {
  itemId: 'contract-catalog-item',
  titleId: 'contract-catalog-item-title',
  bodyId: 'contract-catalog-item-body',
}

function headerRowFromGroup(label: RegExp | string): HTMLElement {
  const shell = screen.getByRole('group', { name: label })
  return shell.firstElementChild as HTMLElement
}

describe('CollapsibleListItem-based row rhythm contract', () => {
  it('keeps adapter header wrappers free of vertical padding literals', () => {
    expect(disclosureEntityCardHeaderPaddingVariants()).not.toMatch(/\bpy-\d/)
    expect(disclosureEntityCardHeaderPaddingVariants()).not.toMatch(/\bp[bt]-\d/)
    expect(catalogEntityRowHeaderPaddingVariants()).not.toMatch(/\bpy-\d/)
    expect(catalogEntityRowHeaderPaddingVariants()).not.toMatch(/\bp[bt]-\d/)
  })

  it('applies shared compact header rhythm on form-array, DEC, and catalog rows', () => {
    render(
      <CollapsibleListItem
        itemId="form-array-item"
        titleId="form-array-item-title"
        toolbarAriaLabel="Damage effect"
        collapsible
        collapsed={false}
        onToggleCollapse={vi.fn()}
        actionsAlign="center"
        header={<span>Damage — 1d10 Fire damage</span>}
        summary={<span>Inflicts 1d10 Fire damage.</span>}
        body={<p>Effect fields</p>}
      />,
    )

    render(
      <MemoryRouter>
        <DisclosureEntityCard
          itemId="dec-item"
          toolbarAriaLabel="Feat choice"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Grant fields</p>
        </DisclosureEntityCard>
      </MemoryRouter>,
    )

    render(
      <CatalogEntityRow
        toolbarLabel="Dagger"
        domIds={catalogDomIds}
        collapsible
        collapsed={false}
        entity={{ heading: 'Dagger', classification: 'Weapon' }}
        details={<p>Catalog details</p>}
      />,
    )

    expect(headerRowFromGroup(/Damage/)).toHaveClass(compactHeaderRhythm)
    expect(headerRowFromGroup(/Harbor District/)).toHaveClass(compactHeaderRhythm)
    expect(headerRowFromGroup(/Dagger/)).toHaveClass(compactHeaderRhythm)
  })

  it('uses the shared body frame on all three adapters', () => {
    render(
      <CollapsibleListItem
        itemId="form-array-body"
        toolbarAriaLabel="Damage effect"
        collapsible
        collapsed={false}
        onToggleCollapse={vi.fn()}
        actionsAlign="center"
        header={<span>Damage</span>}
        body={<p>Effect fields</p>}
      />,
    )

    render(
      <MemoryRouter>
        <DisclosureEntityCard
          itemId="dec-body"
          toolbarAriaLabel="Feat choice"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Grant fields</p>
        </DisclosureEntityCard>
      </MemoryRouter>,
    )

    render(
      <CatalogEntityRow
        toolbarLabel="Dagger"
        domIds={{
          itemId: 'contract-catalog-body',
          titleId: 'contract-catalog-body-title',
          bodyId: 'contract-catalog-body-body',
        }}
        collapsible
        collapsed={false}
        entity={{ heading: 'Dagger' }}
        details={<p>Catalog details</p>}
      />,
    )

    expect(screen.getByText('Effect fields').parentElement).toHaveClass(
      collapsibleListItemBodyFrameClasses,
    )
    expect(screen.getByText('Grant fields').parentElement).toHaveClass(
      collapsibleListItemBodyFrameClasses,
    )
    expect(screen.getByText('Catalog details').parentElement).toHaveClass(
      collapsibleListItemBodyFrameClasses,
    )
  })

  it('keeps compact header rhythm identical collapsed and expanded', () => {
    const sharedProps = {
      itemId: 'form-array-toggle',
      titleId: 'form-array-toggle-title',
      toolbarAriaLabel: 'Damage effect',
      collapsible: true as const,
      onToggleCollapse: vi.fn(),
      actionsAlign: 'center' as const,
      header: <span>Damage — 1d10 Fire damage</span>,
      summary: <span>Inflicts 1d10 Fire damage.</span>,
      body: <p>Effect fields</p>,
    }

    const { unmount: unmountCollapsed } = render(<CollapsibleListItem {...sharedProps} collapsed />)
    const collapsedHeader = headerRowFromGroup(/Damage/)
    unmountCollapsed()

    render(<CollapsibleListItem {...sharedProps} collapsed={false} />)
    const expandedHeader = headerRowFromGroup(/Damage/)

    expect(collapsedHeader.className).toBe(expandedHeader.className)
    expect(collapsedHeader).toHaveClass(compactHeaderRhythm)
  })
})
