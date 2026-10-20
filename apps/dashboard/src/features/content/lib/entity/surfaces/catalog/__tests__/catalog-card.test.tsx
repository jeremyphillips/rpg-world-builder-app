import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { collapsibleListItemHeaderVerticalPaddingVariants, RadioGroup } from '@rpg/ui'
import { describe, expect, it, vi } from 'vitest'

import { CatalogCard } from '../catalog-card'
import { catalogCardBodyWashVariants } from '../catalog-card.variants'
import { DASH_ENTITY_CARD_BODY_CLASS } from '../../dash-entity-surface.variants'

const domIds = {
  itemId: 'picker-item-rope',
  titleId: 'picker-item-rope-title',
  bodyId: 'picker-item-rope-body',
}

function entityCardContentFromDisclosureShell(container: HTMLElement): HTMLElement {
  const shell = container.querySelector('[role="group"]') as HTMLElement
  const contentInset = shell.querySelector('.dash-entity-card__content')
  expect(contentInset).toBeTruthy()
  return contentInset as HTMLElement
}

function entityCardContentFromFlatCard(container: HTMLElement): HTMLElement {
  const contentInset = container.querySelector('article .dash-entity-card__content')
  expect(contentInset).toBeTruthy()
  return contentInset as HTMLElement
}

describe('CatalogCard', () => {
  it('uses entity-card CLI mode with disclosure trigger when details are present', () => {
    const { container } = render(
      <CatalogCard
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        entity={{ heading: 'Rope' }}
        trailing={{ kind: 'action', content: <button type="button">Add</button> }}
        details={<p>Item details</p>}
      />,
    )

    const frame = container.querySelector('article') as HTMLElement
    expect(frame).toHaveClass('ui-card--quiet')
    expect(frame).toHaveClass('dash-entity-surface--start-utility')
    expect(frame).toHaveClass('dash-entity-surface--leading-1')
    expect(frame).not.toHaveAttribute('style')

    const shell = screen.getByRole('group')
    expect(shell).toHaveClass('ui-collapsible-list-item--entity-card')
    expect(shell).not.toHaveClass('pl-2')
    expect(shell).not.toHaveClass('ui-card--quiet')
    expect(shell.style.length).toBe(0)

    const headerRow = shell.firstElementChild as HTMLElement
    expect(headerRow).toHaveClass('ui-collapsible-list-item__header')
    expect(headerRow).not.toHaveClass(
      collapsibleListItemHeaderVerticalPaddingVariants({ density: 'compact' }),
    )

    const contentInset = entityCardContentFromDisclosureShell(container)
    expect(contentInset).toHaveClass('dash-entity-card__content')

    const leading = document.querySelector('[data-entity-item-slot="leading"]')
    expect(leading?.querySelector('button[aria-expanded]')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rope' })).toBeNull()
  })

  it('uses compact content inset for flat rows without details', () => {
    const { container } = render(
      <CatalogCard
        toolbarLabel="The Foos"
        domIds={domIds}
        entity={{ heading: 'The Foos', classification: 'Government' }}
        trailing={{ kind: 'action', content: <button type="button">Select</button> }}
      />,
    )

    const frame = container.querySelector('article') as HTMLElement
    expect(frame).toHaveClass('dash-entity-surface--start-default')
    expect(frame).toHaveClass('dash-entity-surface--compact')
    expect(frame).toHaveClass('dash-entity-surface--leading-0')
    expect(frame).not.toHaveAttribute('style')

    expect(screen.queryByRole('group')).toBeNull()

    const contentInset = entityCardContentFromFlatCard(container)
    expect(contentInset).toHaveClass('dash-entity-card__content')

    expect(screen.queryByRole('button', { name: 'The Foos' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('renders selection mode with a leading radio inside the card frame', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(
      <RadioGroup aria-label="Organizations" value="" onValueChange={onValueChange}>
        <CatalogCard
          toolbarLabel="The Foos"
          domIds={domIds}
          entity={{ heading: 'The Foos', classification: 'Government' }}
          selection={{ value: 'org-1' }}
        />
      </RadioGroup>,
    )

    const frame = document.querySelector('article') as HTMLElement
    expect(frame).toHaveClass('ui-card--interactive')
    expect(frame).toHaveClass('dash-entity-surface--leading-1')
    expect(screen.getByRole('radio', { name: 'The Foos' })).toBeInTheDocument()
    const leadingSlot = document.querySelector('[data-entity-item-slot="leading"]')
    expect(leadingSlot).toHaveAttribute('data-row-anatomy-slot', 'full')
    await user.click(screen.getByText('The Foos'))
    expect(onValueChange).toHaveBeenCalledWith('org-1')
  })

  it('keeps the disclosure trigger before details are mounted', () => {
    render(
      <CatalogCard
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        collapsed
        onToggleCollapse={() => undefined}
        entity={{ heading: 'Rope' }}
      />,
    )

    expect(screen.getByRole('button', { name: 'Expand Rope' })).toBeInTheDocument()
  })

  it('aligns expanded body with entity inline start and end inset', () => {
    render(
      <CatalogCard
        toolbarLabel="Rope"
        domIds={domIds}
        collapsible
        collapsed={false}
        entity={{ heading: 'Rope' }}
        details={<p>Expanded details</p>}
      />,
    )

    const body = screen.getByText('Expanded details').parentElement
    expect(body).toHaveClass(catalogCardBodyWashVariants())
    expect(body).toHaveClass(DASH_ENTITY_CARD_BODY_CLASS)
    expect(body).not.toHaveClass('-ml-2')
  })
})
