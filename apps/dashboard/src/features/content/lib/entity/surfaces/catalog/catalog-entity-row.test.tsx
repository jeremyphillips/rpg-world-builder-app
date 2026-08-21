import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CatalogEntityRow } from './catalog-entity-row.client'
import {
  catalogEntityRowBodyWashVariants,
  catalogEntityRowInsetRootVariants,
} from './catalog-entity-row.variants'
import { ENTITY_CONTENT_OFFSET_VAR } from '../../anatomy/entity-leading-rail.lib'

const domIds = {
  itemId: 'picker-item-rope',
  titleId: 'picker-item-rope-title',
  bodyId: 'picker-item-rope-body',
}

describe('CatalogEntityRow', () => {
  it('uses entity-card CLI mode with disclosure trigger when details are present', () => {
    const { container } = render(
      <CatalogEntityRow
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        entity={{ heading: 'Rope' }}
        trailing={{ kind: 'action', content: <button type="button">Add</button> }}
        details={<p>Item details</p>}
      />,
    )

    const insetRoot = container.firstElementChild as HTMLElement
    expect(insetRoot).toHaveClass(catalogEntityRowInsetRootVariants({ leading: true }))
    expect(insetRoot).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*1)]')
    expect(insetRoot.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
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

  it('uses normal compact inset for flat rows without details', () => {
    const { container } = render(
      <CatalogEntityRow
        toolbarLabel="The Foos"
        domIds={domIds}
        entity={{ heading: 'The Foos', classification: 'Government' }}
        trailing={{ kind: 'action', content: <button type="button">Select</button> }}
      />,
    )

    const insetRoot = container.firstElementChild as HTMLElement
    expect(insetRoot).toHaveClass(catalogEntityRowInsetRootVariants({ leading: false }))
    expect(insetRoot).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*3)]')
    expect(insetRoot.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toBe('')

    expect(screen.queryByRole('button', { name: 'The Foos' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('aligns expanded body with entity inline start and end inset', () => {
    render(
      <CatalogEntityRow
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        collapsed={false}
        entity={{ heading: 'Rope' }}
        details={<p>Expanded details</p>}
      />,
    )

    const body = screen.getByText('Expanded details').parentElement
    expect(body).toHaveClass(catalogEntityRowBodyWashVariants())
    expect(body).toHaveClass('pl-[var(--entity-body-inline-start)]')
    expect(body).not.toHaveClass('-ml-2')
  })
})
