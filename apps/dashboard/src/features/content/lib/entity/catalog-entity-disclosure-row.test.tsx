import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CatalogEntityDisclosureRow } from './catalog-entity-disclosure-row.client'
import {
  catalogEntityDisclosureRowBodyWashVariants,
  catalogEntityDisclosureRowSurfaceVariants,
} from './catalog-entity-disclosure-row.variants'
import { ENTITY_CONTENT_OFFSET_VAR } from './entity-leading-rail.lib'

const domIds = {
  itemId: 'picker-item-rope',
  titleId: 'picker-item-rope-title',
  bodyId: 'picker-item-rope-body',
}

describe('CatalogEntityDisclosureRow', () => {
  it('uses entity-card CLI mode with disclosure trigger in leading rail', () => {
    const { container } = render(
      <CatalogEntityDisclosureRow
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        entity={{ heading: 'Rope' }}
        trailing={{ kind: 'action', content: <button type="button">Add</button> }}
        details={<p>Item details</p>}
      />,
    )

    const surface = container.firstElementChild as HTMLElement
    expect(surface).toHaveClass(catalogEntityDisclosureRowSurfaceVariants())
    expect(surface).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*1)]')
    expect(surface.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(var(--spacing)*6)',
    )

    const shell = screen.getByRole('group')
    expect(shell).toHaveClass('p-0')
    expect(shell).not.toHaveClass('pl-2')

    const leading = document.querySelector('[data-entity-item-slot="leading"]')
    expect(leading?.querySelector('button[aria-expanded]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rope' })).toBeNull()
  })

  it('aligns expanded body with entity inline start and end inset', () => {
    render(
      <CatalogEntityDisclosureRow
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        collapsed={false}
        entity={{ heading: 'Rope' }}
        details={<p>Expanded details</p>}
      />,
    )

    const body = screen.getByText('Expanded details').parentElement
    expect(body).toHaveClass(catalogEntityDisclosureRowBodyWashVariants())
    expect(body).toHaveClass('pl-[var(--entity-body-inline-start)]')
    expect(body).not.toHaveClass('-ml-2')
  })
})
