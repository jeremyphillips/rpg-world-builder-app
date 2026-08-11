import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { DisclosureEntityCard } from './disclosure-entity-card.client'
import { HARBOR_DISTRICT_ENTITY } from './entity.fixture'

const mockDragHandleProps = {
  attributes: {
    role: 'button',
    tabIndex: 0,
    'aria-disabled': false,
    'aria-pressed': false,
    'aria-roledescription': 'draggable',
    'aria-describedby': 'dnd-kit-description',
  },
  listeners: {},
} as const

describe('DisclosureEntityCard', () => {
  it('renders entity identity and hides body when collapsed by default', () => {
    render(
      <MemoryRouter>
        <DisclosureEntityCard
          itemId="harbor"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          href="/campaigns/demo/locations/harbor"
        >
          <p>Expanded inventory details</p>
        </DisclosureEntityCard>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Harbor District' })).toHaveAttribute(
      'href',
      '/campaigns/demo/locations/harbor',
    )
    expect(screen.getByText('Located in Grey Coast')).toBeInTheDocument()
    expect(screen.getByText('Expanded inventory details').parentElement).toHaveAttribute('hidden')
  })

  it('expands body content and keeps the header/body divider on the disclosure shell', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        defaultCollapsed={false}
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    const body = screen.getByText('Expanded inventory details').parentElement
    expect(body).not.toHaveAttribute('hidden')
    expect(body).toHaveClass('border-t', 'bg-surface-muted')
    expect(body).toHaveClass('pl-[var(--entity-content-indent)]')

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell).toHaveClass('[--entity-content-indent:var(--content-column-indent)]')
    expect(shell.style.getPropertyValue('--content-column-indent')).toContain(
      '--leading-chrome-size',
    )
  })

  it('toggles collapse from the caret control', async () => {
    const user = userEvent.setup()
    const onToggleCollapse = vi.fn()

    render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        collapsed
        onToggleCollapse={onToggleCollapse}
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    await user.click(screen.getByRole('button', { name: 'Expand Harbor District' }))
    expect(onToggleCollapse).toHaveBeenCalledOnce()
  })

  it('uses equal-width leading chrome columns for grip and caret', () => {
    render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    const expandButton = screen.getByRole('button', { name: 'Expand Harbor District' })
    const dragButton = screen.getByRole('button', { name: 'Drag to reorder Harbor District' })

    expect(expandButton.parentElement).toHaveClass('w-[var(--leading-chrome-size)]')
    expect(dragButton.parentElement).toHaveClass('w-[var(--leading-chrome-size)]')
  })

  it('renders caret-only leading chrome when drag is omitted', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell.style.getPropertyValue('--leading-chrome-count')).toBe('1')
    expect(screen.getByRole('button', { name: 'Expand Harbor District' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/drag to reorder/i)).not.toBeInTheDocument()
  })

  it('applies presentational disabled treatment on the outer shell', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        disabled
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    const article = container.querySelector('article')
    expect(article).toHaveAttribute('data-disabled', 'true')
    expect(article).toHaveClass('opacity-60')
  })

  it('forwards action and leading seams to EntityItem anatomy', () => {
    render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        leading={<span data-testid="leading-seam">Grip</span>}
        action={<button type="button">Remove</button>}
        defaultCollapsed={false}
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    expect(screen.getByTestId('leading-seam')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })
})
