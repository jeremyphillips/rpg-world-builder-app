import { render } from '@testing-library/react'
import { CollapsibleListItem } from '@rpg/ui'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { HARBOR_DISTRICT_ENTITY } from '../../__tests__/entity.fixture'
import { CatalogEntityRow } from '../catalog/catalog-entity-row'
import { entityCardContentInsetVariants } from '../cards/content/entity-card-content.variants'
import { ContentEntityCard } from '../cards/content/content-entity-card'
import { DisclosureEntityCard } from '../cards/disclosure/disclosure-entity-card'

const compactContentInset = entityCardContentInsetVariants({ density: 'compact' })
const comfortableContentInset = entityCardContentInsetVariants({ density: 'comfortable' })

const MEANINGFUL_PADDING_PATTERN = /\b(p[xytblr]-(?!0\b)\d+|p-(?!0\b)\d+)\b/

function assertNoMeaningfulPadding(className: string) {
  for (const token of className.split(/\s+/).filter(Boolean)) {
    expect(token, `unexpected padding class: ${token}`).not.toMatch(MEANINGFUL_PADDING_PATTERN)
  }
}

function countEntityCardContentRegions(container: HTMLElement): number {
  const article = container.querySelector('article') as HTMLElement
  return Array.from(article.querySelectorAll('*')).filter((element) => {
    const className = element.getAttribute('class') ?? ''
    return (
      className.includes('pl-[var(--entity-surface-inline-start)]') &&
      (className.includes('py-2') || className.includes('py-3'))
    )
  }).length
}

function entityCardContentElement(container: HTMLElement): HTMLElement {
  const article = container.querySelector('article') as HTMLElement
  const contentInset = article.querySelector('.pl-\\[var\\(--entity-surface-inline-start\\)\\]')
  expect(contentInset).toBeTruthy()
  return contentInset as HTMLElement
}

const catalogDomIds = {
  itemId: 'host-contract-item',
  titleId: 'host-contract-item-title',
  bodyId: 'host-contract-item-body',
}

describe('Entity card host contract (single inset owner)', () => {
  it('keeps entity-card CLI shell and header row free of meaningful padding', () => {
    for (const collapsed of [true, false]) {
      const { container, unmount } = render(
        <CatalogEntityRow
          toolbarLabel="Rope"
          domIds={{ ...catalogDomIds, itemId: `disclosure-${collapsed}` }}
          collapsible
          collapsed={collapsed}
          onToggleCollapse={vi.fn()}
          entity={{ heading: 'Rope' }}
          details={<p>Details</p>}
        />,
      )

      const shell = container.querySelector('[role="group"]') as HTMLElement
      const headerRow = shell.firstElementChild as HTMLElement
      assertNoMeaningfulPadding(shell.className)
      assertNoMeaningfulPadding(headerRow.className)
      unmount()
    }
  })

  it('renders exactly one EntityCardContent region on CEC, DEC, and CatalogEntityRow', () => {
    const { container: cecContainer } = render(
      <MemoryRouter>
        <ContentEntityCard entity={HARBOR_DISTRICT_ENTITY} density="compact" />
      </MemoryRouter>,
    )

    const { container: decContainer } = render(
      <MemoryRouter>
        <DisclosureEntityCard
          itemId="dec-host"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          density="compact"
          defaultCollapsed={false}
        >
          <p>Grant fields</p>
        </DisclosureEntityCard>
      </MemoryRouter>,
    )

    const { container: flatCatalogContainer } = render(
      <CatalogEntityRow
        toolbarLabel="City Guard"
        domIds={catalogDomIds}
        entity={{ heading: 'City Guard', classification: 'Government' }}
      />,
    )

    const { container: disclosureCatalogContainer } = render(
      <CatalogEntityRow
        toolbarLabel="Wooden Staff"
        domIds={{ ...catalogDomIds, itemId: 'disclosure-catalog' }}
        collapsible
        collapsed={false}
        entity={{ heading: 'Wooden Staff', classification: 'Adventuring Gear' }}
        details={<p>Spellcasting focus</p>}
      />,
    )

    expect(countEntityCardContentRegions(cecContainer)).toBe(1)
    expect(countEntityCardContentRegions(decContainer)).toBe(1)
    expect(countEntityCardContentRegions(flatCatalogContainer)).toBe(1)
    expect(countEntityCardContentRegions(disclosureCatalogContainer)).toBe(1)
  })

  it('resolves identical compact header inset on flat and disclosure catalog rows', () => {
    const { container: flatContainer } = render(
      <CatalogEntityRow
        toolbarLabel="City Guard"
        domIds={catalogDomIds}
        entity={{ heading: 'City Guard', classification: 'Government' }}
      />,
    )

    const { container: disclosureContainer } = render(
      <CatalogEntityRow
        toolbarLabel="Wooden Staff"
        domIds={{ ...catalogDomIds, itemId: 'disclosure-parity' }}
        collapsible
        collapsed={false}
        entity={{ heading: 'Wooden Staff', classification: 'Adventuring Gear' }}
        details={<p>Spellcasting focus</p>}
      />,
    )

    const flatInset = entityCardContentElement(flatContainer).className
    const disclosureInset = entityCardContentElement(disclosureContainer).className
    expect(flatInset).toBe(disclosureInset)
    expect(flatInset).toContain(compactContentInset)
  })

  it('resolves identical content inset classes across all three hosts at compact density', () => {
    const { container: cecContainer } = render(
      <MemoryRouter>
        <ContentEntityCard entity={HARBOR_DISTRICT_ENTITY} density="compact" />
      </MemoryRouter>,
    )

    const { container: decContainer } = render(
      <MemoryRouter>
        <DisclosureEntityCard
          itemId="dec-parity"
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
        toolbarLabel="City Guard"
        domIds={catalogDomIds}
        entity={{ heading: 'City Guard' }}
      />,
    )

    const insetClassNames = [
      entityCardContentElement(cecContainer).className,
      entityCardContentElement(decContainer).className,
      entityCardContentElement(catalogContainer).className,
    ]

    expect(new Set(insetClassNames).size).toBe(1)
    expect(insetClassNames[0]).toContain(compactContentInset)
  })

  it('maps comfortable density inset on EntityCardContent only', () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard entity={HARBOR_DISTRICT_ENTITY} density="comfortable" />
      </MemoryRouter>,
    )

    const article = container.querySelector('article') as HTMLElement
    const content = entityCardContentElement(container)
    assertNoMeaningfulPadding(article.className)
    expect(content.className).toContain(comfortableContentInset)
  })

  it('does not apply entity-card header padding on default CLI rows with collapsible=false', () => {
    const { container } = render(
      <CollapsibleListItem
        itemId="flat-cli-row"
        titleId="flat-cli-row-title"
        toolbarAriaLabel="Flat CLI row"
        rowLayout="entity-card"
        collapsible={false}
        header={<span>Flat header</span>}
      />,
    )

    const shell = container.firstElementChild as HTMLElement
    const headerRow = shell.firstElementChild as HTMLElement
    assertNoMeaningfulPadding(shell.className)
    assertNoMeaningfulPadding(headerRow.className)
  })
})
