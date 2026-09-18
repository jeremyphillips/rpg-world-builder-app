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
import { entityCardContentInsetVariants } from '../cards/content/entity-card-content.variants'
import { ContentEntityCard } from '../cards/content/content-entity-card'
import { DisclosureEntityCard } from '../cards/disclosure/disclosure-entity-card'

const compactHeaderRhythm = collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' })
const compactContentInset = entityCardContentInsetVariants({ density: 'compact' })

const catalogDomIds = {
  itemId: 'contract-catalog-item',
  titleId: 'contract-catalog-item-title',
  bodyId: 'contract-catalog-item-body',
}

function headerRowFromGroup(label: RegExp | string): HTMLElement {
  const shell = screen.getByRole('group', { name: label })
  return shell.firstElementChild as HTMLElement
}

function entityCardContentFromGroup(label: RegExp | string): HTMLElement {
  const shell = screen.getByRole('group', { name: label })
  const contentInset = shell.querySelector('.pl-\\[var\\(--entity-surface-inline-start\\)\\]')
  expect(contentInset).toBeTruthy()
  return contentInset as HTMLElement
}

describe('Entity card surface rhythm contract', () => {
  it('keeps entity-card CLI header rows free of vertical padding', () => {
    render(
      <CatalogEntityRow
        toolbarLabel="Dagger"
        domIds={catalogDomIds}
        entity={{ heading: 'Dagger', classification: 'Weapon' }}
      />,
    )

    expect(headerRowFromGroup(/Dagger/)).not.toHaveClass(compactHeaderRhythm)
  })

  it('applies shared compact content inset on CEC, DEC, and catalog rows', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard entity={HARBOR_DISTRICT_ENTITY} density="compact" />
      </MemoryRouter>,
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

    const cecContent = document.querySelector('article > div') as HTMLElement
    expect(cecContent).toHaveClass(compactContentInset)

    expect(entityCardContentFromGroup(/Harbor District/)).toHaveClass(compactContentInset)
    expect(entityCardContentFromGroup(/Dagger/)).toHaveClass(compactContentInset)
  })

  it('keeps default CLI header rhythm on non-entity-card form-array rows', () => {
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

    expect(headerRowFromGroup(/Damage/)).toHaveClass(compactHeaderRhythm)
  })

  it('uses the shared body frame on DEC and catalog disclosure rows', () => {
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

    expect(screen.getByText('Grant fields').parentElement).toHaveClass(
      collapsibleListItemBodyFrameClasses,
    )
    expect(screen.getByText('Catalog details').parentElement).toHaveClass(
      collapsibleListItemBodyFrameClasses,
    )
  })

  it('renders exactly one EntityCardContent inset region per entity-card host header', () => {
    const { container: decContainer } = render(
      <MemoryRouter>
        <DisclosureEntityCard
          itemId="dec-single-inset"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Body</p>
        </DisclosureEntityCard>
      </MemoryRouter>,
    )

    const { container: catalogContainer } = render(
      <CatalogEntityRow
        toolbarLabel="Flat row"
        domIds={{
          itemId: 'flat-row',
          titleId: 'flat-row-title',
          bodyId: 'flat-row-body',
        }}
        entity={{ heading: 'Flat row' }}
      />,
    )

    for (const container of [decContainer, catalogContainer]) {
      const article = container.querySelector('article') as HTMLElement
      const insetRegions = Array.from(article.querySelectorAll('*')).filter((element) => {
        const className = element.getAttribute('class') ?? ''
        return (
          className.includes('pl-[var(--entity-surface-inline-start)]') &&
          className.includes('py-2')
        )
      })
      expect(insetRegions).toHaveLength(1)
    }
  })
})
