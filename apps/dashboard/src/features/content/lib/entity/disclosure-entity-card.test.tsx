import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { DisclosureEntityCard } from './disclosure-entity-card.client'
import {
  disclosureEntityCardBodyInlineEndClasses,
  disclosureEntityCardBodyInlineStartClasses,
} from './disclosure-entity-card.variants'
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

function bodyFor(label: string): HTMLElement {
  return screen.getByText(label).parentElement as HTMLElement
}

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
    expect(body).toHaveClass(disclosureEntityCardBodyInlineStartClasses)
    expect(body).toHaveClass(disclosureEntityCardBodyInlineEndClasses)

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell).toHaveClass('[--entity-content-indent:var(--content-column-indent)]')
    expect(shell).toHaveClass('[--entity-density-inline:calc(var(--spacing)*5)]')
    expect(shell.style.getPropertyValue('--content-column-indent')).toContain(
      '--leading-chrome-size',
    )
  })

  it('keeps body inline-end inset identical regardless of trailing action width', () => {
    const cases = [
      { id: 'none', action: undefined, label: 'Body none' },
      {
        id: 'delete',
        action: <button type="button">Remove</button>,
        label: 'Body delete',
      },
      {
        id: 'add',
        action: <button type="button">Add</button>,
        label: 'Body add',
      },
      {
        id: 'wide',
        action: <button type="button">Add to inventory · 105 GP</button>,
        label: 'Body wide',
      },
    ] as const

    render(
      <div>
        {cases.map((entry) => (
          <DisclosureEntityCard
            key={entry.id}
            itemId={entry.id}
            toolbarAriaLabel={entry.id}
            entity={HARBOR_DISTRICT_ENTITY}
            action={entry.action}
            density="compact"
            defaultCollapsed={false}
          >
            <p>{entry.label}</p>
          </DisclosureEntityCard>
        ))}
      </div>,
    )

    const classNames = cases.map((entry) => bodyFor(entry.label).className)
    for (const className of classNames) {
      expect(className).toContain(disclosureEntityCardBodyInlineEndClasses)
      expect(className).toContain(disclosureEntityCardBodyInlineStartClasses)
    }
    expect(new Set(classNames).size).toBe(1)
  })

  it('publishes compact density inline token without coupling to trailing chrome', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        density="compact"
        action={<button type="button">Remove</button>}
        defaultCollapsed={false}
      >
        <p>Compact body</p>
      </DisclosureEntityCard>,
    )

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell).toHaveClass('[--entity-density-inline:calc(var(--spacing)*3)]')
    expect(bodyFor('Compact body')).toHaveClass(disclosureEntityCardBodyInlineEndClasses)
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

  it('owns card plane fill independent of parent host surfaces', () => {
    const { container } = render(
      <div className="bg-surface-subtle">
        <DisclosureEntityCard
          itemId="harbor"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          defaultCollapsed={false}
        >
          <p>Expanded inventory details</p>
        </DisclosureEntityCard>
      </div>,
    )

    const article = container.querySelector('article')
    expect(article).toHaveClass('bg-card')
    expect(article?.className).toContain('[--surface-current:var(--card)]')
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
