import { render, screen } from '@testing-library/react'
import {
  CollapsibleListItem,
  collapsibleListItemBodyFrameClasses,
  collapsibleListItemHeaderVerticalPaddingVariants,
} from '@rpg/ui'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { HARBOR_DISTRICT_ENTITY } from '../../__tests__/entity.fixture'
import { CatalogCard } from '../catalog/catalog-card'
import { EntityCard } from '../cards/content/entity-card'

const compactHeaderRhythm = collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' })
const ENTITY_CARD_CONTENT_CLASS = 'dash-entity-card__content'

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
  const contentInset = shell.querySelector(`.${ENTITY_CARD_CONTENT_CLASS}`)
  expect(contentInset).toBeTruthy()
  return contentInset as HTMLElement
}

describe('Entity card surface rhythm contract', () => {
  it('renders flat catalog rows without collapsible list chrome', () => {
    render(
      <CatalogCard
        toolbarLabel="Dagger"
        domIds={catalogDomIds}
        entity={{ heading: 'Dagger', classification: 'Weapon' }}
      />,
    )

    expect(screen.queryByRole('group')).toBeNull()
    expect(document.querySelector('article .dash-entity-card__content')).toBeTruthy()
  })

  it('applies shared compact content inset on EntityCard static, disclosure, and catalog rows', () => {
    render(
      <MemoryRouter>
        <EntityCard entity={HARBOR_DISTRICT_ENTITY} density="compact" />
      </MemoryRouter>,
    )

    render(
      <MemoryRouter>
        <EntityCard
          variant="disclosure"
          itemId="dec-item"
          toolbarAriaLabel="Feat choice"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Grant fields</p>
        </EntityCard>
      </MemoryRouter>,
    )

    render(
      <CatalogCard
        toolbarLabel="Dagger"
        domIds={catalogDomIds}
        collapsible
        collapsed={false}
        entity={{ heading: 'Dagger', classification: 'Weapon' }}
        details={<p>Catalog details</p>}
      />,
    )

    const cecContent = document.querySelector('article > div') as HTMLElement
    expect(cecContent).toHaveClass(ENTITY_CARD_CONTENT_CLASS)

    expect(entityCardContentFromGroup(/Harbor District/)).toHaveClass(ENTITY_CARD_CONTENT_CLASS)
    expect(entityCardContentFromGroup(/Dagger/)).toHaveClass(ENTITY_CARD_CONTENT_CLASS)
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
        header={<span>Damage — 1d10 Fire damage</span>}
        summary={<span>Inflicts 1d10 Fire damage.</span>}
        body={<p>Effect fields</p>}
      />,
    )

    expect(headerRowFromGroup(/Damage/)).toHaveClass(compactHeaderRhythm)
  })

  it('uses the shared body frame on EntityCard disclosure and catalog disclosure rows', () => {
    render(
      <MemoryRouter>
        <EntityCard
          variant="disclosure"
          itemId="dec-body"
          toolbarAriaLabel="Feat choice"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Grant fields</p>
        </EntityCard>
      </MemoryRouter>,
    )

    render(
      <CatalogCard
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
        <EntityCard
          variant="disclosure"
          itemId="dec-single-inset"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Body</p>
        </EntityCard>
      </MemoryRouter>,
    )

    const { container: catalogContainer } = render(
      <CatalogCard
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
      const insetRegions = article.querySelectorAll('.dash-entity-card__content')
      expect(insetRegions).toHaveLength(1)
    }
  })
})
