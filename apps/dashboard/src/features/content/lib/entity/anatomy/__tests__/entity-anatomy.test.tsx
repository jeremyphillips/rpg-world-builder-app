import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { EntityAnatomy } from '../entity-anatomy'
import { GREY_COAST_ENTITY } from '../../__tests__/entity.fixture'

type EntitySlot = 'leading' | 'media' | 'content' | 'description' | 'status' | 'trailing'

function querySlot(container: HTMLElement, slot: EntitySlot | 'trailing-secondary') {
  return container.querySelector<HTMLElement>(`[data-entity-item-slot="${slot}"]`)
}

function renderAnatomy(props: Partial<ComponentProps<typeof EntityAnatomy>> = {}) {
  const { container } = render(
    <MemoryRouter>
      <EntityAnatomy entity={GREY_COAST_ENTITY} density="compact" {...props} />
    </MemoryRouter>,
  )

  const anatomy = container.firstElementChild as HTMLElement

  return {
    anatomy,
    slot: (slot: EntitySlot | 'trailing-secondary') => querySlot(anatomy, slot),
  }
}

function cellOf(element: HTMLElement | null) {
  return {
    slot: element?.getAttribute('data-row-anatomy-slot'),
    column: element?.getAttribute('data-row-anatomy-column'),
  }
}

const SELECT_ACTION = {
  kind: 'action' as const,
  content: <button type="button">Select</button>,
}

describe('EntityAnatomy row tracks', () => {
  it('is a row-anatomy grid with host-owned columns', () => {
    const { anatomy } = renderAnatomy()

    expect(anatomy).toHaveAttribute('data-row-anatomy')
    expect(anatomy.className).toContain('grid-rows-[[slack-start]')
    expect(anatomy.className).toContain(
      'grid-cols-[[leading]_auto_[media]_auto_[content]_minmax(0,1fr)_[trailing]_auto]',
    )
    expect(anatomy.className).not.toMatch(/(^|\s)gap-x-|(^|\s)items-(start|center)\b/)
  })

  it('places heading, description, and status in band, meta, and status cells', () => {
    const { slot } = renderAnatomy({
      entity: {
        heading: 'Amulet',
        classification: 'Adventuring Gear',
        description: 'Holy symbol',
        status: [{ kind: 'badge', label: 'Spellcasting focus' }],
      },
    })

    expect(cellOf(slot('content'))).toEqual({ slot: 'band', column: 'content' })
    expect(cellOf(slot('description'))).toEqual({ slot: 'meta', column: 'content' })
    expect(cellOf(slot('status'))).toEqual({ slot: 'status', column: 'content' })
    expect(slot('content')).toHaveTextContent('Amulet')
    expect(slot('content')).not.toHaveTextContent('Holy symbol')
  })

  it('omits empty meta and status cells', () => {
    const { slot } = renderAnatomy({ entity: { heading: 'Grey Coast' } })

    expect(slot('description')).toBeNull()
    expect(slot('status')).toBeNull()
    expect(slot('leading')).toBeNull()
    expect(slot('trailing')).toBeNull()
  })

  it('places leading utilities and media in band cells of their own columns', () => {
    const { slot } = renderAnatomy({
      leadingUtilities: [<span key="grip">Grip</span>, <span key="caret">Caret</span>],
      entity: { heading: 'Brock', media: <span data-testid="media">M</span> },
    })

    expect(cellOf(slot('leading'))).toEqual({ slot: 'band', column: 'leading' })
    expect(cellOf(slot('media'))).toEqual({ slot: 'band', column: 'media' })
    expect(
      slot('leading')!.querySelectorAll('[class*="w-[var(--leading-chrome-size)]"]'),
    ).toHaveLength(2)
  })

  it('applies leading content gap on the rail and trailing separation from the host columns', () => {
    const { anatomy, slot } = renderAnatomy({
      leadingUtilities: [<span key="grip">Grip</span>],
      trailing: SELECT_ACTION,
    })

    const rail = slot('leading')?.querySelector('.flex.shrink-0.items-center.gap-0')
    expect(rail).toHaveClass('pe-[calc(var(--spacing)*2)]')
    expect(anatomy.className).toContain('[&>[data-row-anatomy-column=trailing]]:ms-2')
    expect(anatomy.className).toContain('[&>[data-row-anatomy-column=trailing]]:justify-self-end')
  })
})

describe('EntityAnatomy trailing kind to cell', () => {
  it('maps action to the band cell', () => {
    const { slot } = renderAnatomy({ trailing: SELECT_ACTION })

    expect(cellOf(slot('trailing'))).toEqual({ slot: 'band', column: 'trailing' })
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('maps utility to the full cell', () => {
    const { slot } = renderAnatomy({
      trailing: { kind: 'utility', content: <button type="button">Remove</button> },
    })

    expect(cellOf(slot('trailing'))).toEqual({ slot: 'full', column: 'trailing' })
  })

  it('maps chevron indicator to full and quantity indicator to band', () => {
    const chevron = renderAnatomy({ trailing: { kind: 'indicator', variant: 'chevron' } })
    expect(cellOf(chevron.slot('trailing')).slot).toBe('full')

    const quantity = renderAnatomy({
      trailing: { kind: 'indicator', variant: 'quantity', quantity: 3 },
    })
    expect(cellOf(quantity.slot('trailing')).slot).toBe('band')
    expect(screen.getByText('×3')).toHaveClass('text-sm')
  })

  it('renders an additional quantity including one', () => {
    renderAnatomy({
      trailing: { kind: 'indicator', variant: 'quantity', quantity: 1, format: 'additional' },
    })
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('renders the group secondary inline in the band cell, before the control', () => {
    const { slot } = renderAnatomy({
      trailing: {
        kind: 'group',
        primary: <button type="button">Add</button>,
        secondary: { kind: 'price', label: '30 GP' },
      },
    })

    const trailing = slot('trailing')
    expect(cellOf(trailing)).toEqual({ slot: 'band', column: 'trailing' })
    expect(trailing).toHaveTextContent('30 GP')
    expect(slot('trailing-secondary')?.textContent).toBe('30 GP')
    expect(slot('trailing-secondary')).toHaveClass(
      'text-xs',
      'font-body-emphasis',
      'text-foreground',
    )
    expect(slot('trailing-secondary')).not.toHaveClass('text-muted-foreground')
    expect(trailing?.textContent).toBe('30 GPAdd')
  })

  it('centers trailing meta with its control without offsetting the cell', () => {
    const { slot } = renderAnatomy({ trailing: SELECT_ACTION })

    const content = slot('trailing')?.firstElementChild as HTMLElement
    expect(content.className).toMatch(/\bitems-center\b/)
    expect(content.className).not.toMatch(/\bself-|\bmt-/)
  })
})
