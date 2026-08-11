import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { EntityItemAnatomy } from './entity-item.client'
import { GREY_COAST_ENTITY } from './entity.fixture'

function querySlot(container: HTMLElement, slot: 'leading' | 'content' | 'trailing') {
  return container.querySelector(`[data-entity-item-slot="${slot}"]`)
}

function renderAnatomy(props: Partial<ComponentProps<typeof EntityItemAnatomy>> = {}) {
  const { container } = render(
    <MemoryRouter>
      <EntityItemAnatomy entity={GREY_COAST_ENTITY} density="compact" {...props} />
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

describe('EntityItemAnatomy grid placement', () => {
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

  it('applies rail spacing only on present leading/trailing slots', () => {
    const { queryLeading, queryTrailing } = renderAnatomy({
      leadingUtilities: [<span>Grip</span>],
      trailing: {
        kind: 'action',
        content: <button type="button">Select</button>,
      },
    })

    expect(queryLeading()).toHaveClass('mr-2')
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
})
