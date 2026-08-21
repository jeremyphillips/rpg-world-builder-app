import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { EntityAnatomy } from './entity-anatomy'
import { GREY_COAST_ENTITY } from '../entity.fixture'

function querySlot(container: HTMLElement, slot: 'leading' | 'content' | 'trailing') {
  return container.querySelector(`[data-entity-item-slot="${slot}"]`)
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
    content: querySlot(anatomy, 'content') as HTMLElement,
    queryLeading: () => querySlot(anatomy, 'leading'),
    queryTrailing: () => querySlot(anatomy, 'trailing'),
  }
}

describe('EntityAnatomy grid placement', () => {
  it('keeps content in column 2 when only content is present', () => {
    const { anatomy, content, queryLeading, queryTrailing } = renderAnatomy()

    expect(content).toHaveClass('col-start-2')
    expect(queryLeading()).toBeNull()
    expect(queryTrailing()).toBeNull()
    expect(anatomy.className).not.toMatch(/\bgap-x-/)
  })

  it('keeps content in column 2 when leading is present', () => {
    const { content, queryLeading, queryTrailing } = renderAnatomy({
      leadingUtilities: [<span data-testid="leading-control">Grip</span>],
    })

    expect(content).toHaveClass('col-start-2')
    expect(queryLeading()).toHaveClass('col-start-1')
    expect(queryTrailing()).toBeNull()
  })

  it('keeps content in column 2 and trailing in column 3 when trailing is present', () => {
    const { content, queryLeading, queryTrailing } = renderAnatomy({
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    expect(content).toHaveClass('col-start-2')
    expect(queryLeading()).toBeNull()
    expect(queryTrailing()).toHaveClass('col-start-3', 'justify-self-end')
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
  })

  it('assigns all three tracks when leading and trailing are present', () => {
    const { content, queryLeading, queryTrailing } = renderAnatomy({
      leadingUtilities: [<span data-testid="leading-control">Grip</span>],
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    expect(queryLeading()).toHaveClass('col-start-1')
    expect(content).toHaveClass('col-start-2')
    expect(queryTrailing()).toHaveClass('col-start-3', 'justify-self-end')
  })

  it('does not introduce phantom leading/trailing spacing when rails are absent', () => {
    const { anatomy } = renderAnatomy()

    expect(anatomy.className).not.toMatch(/\bgap-x-/)
    expect(anatomy.className).not.toMatch(/\bmr-/)
    expect(anatomy.className).not.toMatch(/\bml-/)
  })

  it('applies content gap on the leading rail and trailing slot separation', () => {
    const { queryLeading, queryTrailing } = renderAnatomy({
      leadingUtilities: [<span>Grip</span>],
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    const rail = queryLeading()?.querySelector('.flex.shrink-0.items-center.gap-0')
    expect(rail).toHaveClass('pe-[calc(var(--spacing)*2)]')
    expect(queryLeading()?.className).not.toMatch(/\bmr-/)
    expect(queryTrailing()).toHaveClass('ml-2')
  })

  it('renders two equal-width leading columns for multiple utilities in one rail', () => {
    const { queryLeading } = renderAnatomy({
      leadingUtilities: [<span key="grip">Grip</span>, <span key="caret">Caret</span>],
    })

    const leadingSlot = queryLeading() as HTMLElement
    expect(leadingSlot.querySelectorAll('[class*="w-[var(--leading-chrome-size)]"]')).toHaveLength(
      2,
    )
    expect(leadingSlot.querySelectorAll('.flex.shrink-0.items-center.gap-0')).toHaveLength(1)
  })

  it('top-aligns grid tracks when control chrome is present', () => {
    const { anatomy } = renderAnatomy({
      leadingUtilities: [<span>Grip</span>],
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    expect(anatomy).toHaveClass('items-start')
    expect(anatomy.className).not.toMatch(/\bitems-center\b/)
  })

  it('wraps the heading in a compact-control band when leading chrome exists', () => {
    const { content } = renderAnatomy({
      leadingUtilities: [<span>Grip</span>],
    })

    const band = content.querySelector('[data-entity-summary-band="control"]')
    expect(band).toHaveClass('min-h-control-action-compact', 'items-center')
  })

  it('wraps the heading in a compact-control band when trailing chrome exists', () => {
    const { content } = renderAnatomy({
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    expect(content.querySelector('[data-entity-summary-band="control"]')).toBeInTheDocument()
  })

  it('does not wrap the heading in a control band when no chrome is present', () => {
    const { content } = renderAnatomy()

    expect(content.querySelector('[data-entity-summary-band="control"]')).toBeNull()
  })

  it('does not apply self-center on trailing action chrome', () => {
    const { queryTrailing } = renderAnatomy({
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    const actionWrapper = queryTrailing()?.firstElementChild as HTMLElement
    expect(actionWrapper.className).not.toMatch(/\bself-center\b/)
  })

  it('keeps status in the summary column when trailing action is present', () => {
    render(
      <EntityAnatomy
        density="compact"
        entity={{
          heading: 'Amulet',
          classification: 'Adventuring Gear',
          description: 'Holy symbol',
          status: [{ kind: 'badge', label: 'Spellcasting focus' }],
        }}
        trailing={{
          kind: 'action',
          content: <button type="button">Add</button>,
        }}
      />,
    )

    expect(screen.getByText('Spellcasting focus')).toBeInTheDocument()
    expect(document.querySelector('[data-entity-summary-status-row]')).toBeTruthy()
    expect(document.querySelector('[data-entity-item-slot="trailing"]')).toBeTruthy()
  })
})
