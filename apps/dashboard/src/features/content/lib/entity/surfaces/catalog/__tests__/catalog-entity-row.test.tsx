import { render, screen } from '@testing-library/react'
import { collapsibleListItemHeaderVerticalPaddingVariants } from '@rpg/ui'
import { describe, expect, it } from 'vitest'

import { CatalogEntityRow } from '../catalog-entity-row'
import { catalogEntityRowBodyWashVariants } from '../catalog-entity-row.variants'
import { entityCardContentInsetVariants } from '../../cards/content/entity-card-content.variants'
import { ENTITY_CONTENT_OFFSET_VAR } from '../../../anatomy/entity-leading-rail.lib'

const domIds = {
  itemId: 'picker-item-rope',
  titleId: 'picker-item-rope-title',
  bodyId: 'picker-item-rope-body',
}

const compactContentInset = entityCardContentInsetVariants({ density: 'compact' })

function entityCardContentFromShell(container: HTMLElement): HTMLElement {
  const shell = container.querySelector('[role="group"]') as HTMLElement
  const contentInset = shell.querySelector('.pl-\\[var\\(--entity-surface-inline-start\\)\\]')
  expect(contentInset).toBeTruthy()
  return contentInset as HTMLElement
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

    const frame = container.querySelector('article') as HTMLElement
    expect(frame).toHaveClass('bg-catalog-picker-row-surface')
    expect(frame).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*1)]')
    expect(frame.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(var(--spacing)*6)',
    )

    const shell = screen.getByRole('group')
    expect(shell).toHaveClass('p-0')
    expect(shell).not.toHaveClass('pl-2')
    expect(shell).not.toHaveClass('bg-catalog-picker-row-surface')

    const headerRow = shell.firstElementChild as HTMLElement
    expect(headerRow).not.toHaveClass(
      collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' }),
    )

    const contentInset = entityCardContentFromShell(container)
    expect(contentInset).toHaveClass(compactContentInset)

    const leading = document.querySelector('[data-entity-item-slot="leading"]')
    expect(leading?.querySelector('button[aria-expanded]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rope' })).toBeNull()
  })

  it('uses compact content inset for flat rows without details', () => {
    const { container } = render(
      <CatalogEntityRow
        toolbarLabel="The Foos"
        domIds={domIds}
        entity={{ heading: 'The Foos', classification: 'Government' }}
        trailing={{ kind: 'action', content: <button type="button">Select</button> }}
      />,
    )

    const frame = container.querySelector('article') as HTMLElement
    expect(frame).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*4)]')
    expect(frame.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toBe('')

    const contentInset = entityCardContentFromShell(container)
    expect(contentInset).toHaveClass(compactContentInset)

    const headerRow = screen.getByRole('group').firstElementChild as HTMLElement
    expect(headerRow).not.toHaveClass(
      collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' }),
    )

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
