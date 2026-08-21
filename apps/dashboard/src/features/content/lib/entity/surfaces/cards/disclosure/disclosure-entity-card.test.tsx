import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { DisclosureEntityCard } from './disclosure-entity-card.client'
import {
  disclosureEntityCardBodyInlineEndClasses,
  disclosureEntityCardBodyInlineStartClasses,
} from './disclosure-entity-card.variants'
import {
  ENTITY_BODY_INLINE_START_VAR,
  ENTITY_CONTENT_OFFSET_VAR,
} from '../../../item/entity-leading-rail.lib'
import { HARBOR_DISTRICT_ENTITY } from '../../../entity.fixture'

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
          headingHref="/campaigns/demo/locations/harbor"
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

    const article = container.querySelector('article') as HTMLElement
    expect(article.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(var(--spacing)*6)',
    )
    expect(article.style.getPropertyValue(ENTITY_BODY_INLINE_START_VAR)).toBe(
      'calc(var(--entity-surface-inline-start) + var(--entity-content-offset))',
    )
    expect(article).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*2)]')
    expect(article).toHaveClass('[--entity-surface-inline-end:calc(var(--spacing)*5)]')

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell.className).not.toContain('--entity-surface-inline-start')
  })

  it('keeps body inline-end inset identical regardless of trailing action width', () => {
    const cases = [
      { id: 'none', trailing: undefined, label: 'Body none' },
      {
        id: 'delete',
        trailing: { kind: 'action' as const, content: <button type="button">Remove</button> },
        label: 'Body delete',
      },
      {
        id: 'add',
        trailing: { kind: 'action' as const, content: <button type="button">Add</button> },
        label: 'Body add',
      },
      {
        id: 'wide',
        trailing: {
          kind: 'action' as const,
          content: <button type="button">Add to inventory · 105 GP</button>,
        },
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
            trailing={entry.trailing}
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

  it('publishes compact surface inset tokens without coupling to trailing chrome', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        density="compact"
        trailing={{ kind: 'action', content: <button type="button">Remove</button> }}
        defaultCollapsed={false}
      >
        <p>Compact body</p>
      </DisclosureEntityCard>,
    )

    const shell = container.querySelector('[role="group"]') as HTMLElement
    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('[--entity-surface-inline-start:calc(var(--spacing)*1)]')
    expect(article).toHaveClass('[--entity-surface-inline-end:calc(var(--spacing)*3)]')
    expect(shell.className).not.toContain('--entity-surface-inline-start')
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

    const article = container.querySelector('article') as HTMLElement
    expect(article.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(var(--spacing)*6)',
    )
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

  it('forwards trailing seam to EntityItem anatomy', () => {
    render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        trailing={{ kind: 'action', content: <button type="button">Remove</button> }}
        defaultCollapsed={false}
      >
        <p>Expanded inventory details</p>
      </DisclosureEntityCard>,
    )

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('fills the header region so short-heading trailing aligns to column 3', () => {
    const { container } = render(
      <div className="w-[480px]">
        <DisclosureEntityCard
          itemId="short-heading"
          toolbarAriaLabel="Harbor District"
          entity={{ heading: 'Light' }}
          density="compact"
          trailing={{ kind: 'action', content: <button type="button">Remove</button> }}
          defaultCollapsed={false}
        >
          <p>Body</p>
        </DisclosureEntityCard>
      </div>,
    )

    const headerWrap = screen
      .getByText('Light', { selector: '.font-body-emphasis' })
      .closest('[class*="pl-[var(--entity-surface-inline-start)]"]') as HTMLElement
    const anatomy = headerWrap.querySelector('.grid') as HTMLElement
    const trailing = container.querySelector('[data-entity-item-slot="trailing"]') as HTMLElement
    const content = container.querySelector('[data-entity-item-slot="content"]') as HTMLElement

    expect(headerWrap).toHaveClass('w-full', 'min-w-0')
    expect(anatomy).toHaveClass('w-full', 'grid-cols-[auto_minmax(0,1fr)_auto]')
    expect(content).toHaveClass('col-start-2')
    expect(trailing).toHaveClass('col-start-3', 'justify-self-end')
    expect(trailing.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_PRECEDING)
  })

  it('keeps trailing in column 3 when heading and description wrap', () => {
    const { container } = render(
      <div className="w-[320px]">
        <DisclosureEntityCard
          itemId="long-heading"
          toolbarAriaLabel="Grants · Speak with Animals"
          entity={{
            heading: 'Speak with Animals',
            classification: 'Spells',
            description:
              'Character has Speak with Animals always prepared and other long supporting copy that wraps across multiple lines in compact density.',
          }}
          density="compact"
          dragHandleProps={mockDragHandleProps}
          trailing={{ kind: 'action', content: <button type="button">Remove</button> }}
          defaultCollapsed={false}
        >
          <p>Body</p>
        </DisclosureEntityCard>
      </div>,
    )

    const content = container.querySelector('[data-entity-item-slot="content"]') as HTMLElement
    const trailing = container.querySelector('[data-entity-item-slot="trailing"]') as HTMLElement
    const anatomy = content.parentElement as HTMLElement

    expect(anatomy).toHaveClass('w-full')
    expect(content).toHaveClass('col-start-2', 'min-w-0')
    expect(trailing).toHaveClass('col-start-3', 'justify-self-end')
    expect(
      screen.getByText(/Character has Speak with Animals always prepared/i),
    ).toBeInTheDocument()
  })

  it('does not merge legacy CLI body inset when rowLayout is entity-card', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
        density="compact"
        defaultCollapsed={false}
      >
        <p>Isolated body</p>
      </DisclosureEntityCard>,
    )

    const body = bodyFor('Isolated body')
    expect(body).toHaveClass(disclosureEntityCardBodyInlineStartClasses)
    expect(body).toHaveClass(disclosureEntityCardBodyInlineEndClasses)
    expect(body.className).not.toContain('content-column-indent')
    expect(body.className).not.toContain('content-inline-start')
    expect(
      body.className.split(/\s+/).filter((token) => token === 'pt-3').length,
    ).toBeLessThanOrEqual(1)

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell.style.getPropertyValue('--content-column-indent')).toBe('')
    expect(shell.style.getPropertyValue('--content-inline-start')).toBe('')

    const headerWrap = screen
      .getByText('Harbor District', { selector: '.font-body-emphasis' })
      .closest('[class*="pl-[var(--entity-surface-inline-start)]"]') as HTMLElement
    expect(headerWrap.className).toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)
    expect(headerWrap.className).toMatch(/pr-\[var\(--entity-surface-inline-end\)\]/)
  })

  it('matches leading offset to grip+caret count on the article root', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
        defaultCollapsed={false}
      >
        <p>Grip and caret body</p>
      </DisclosureEntityCard>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(2 * calc(var(--spacing)*6)',
    )
  })

  it('matches leading offset to caret-only count on the article root', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        defaultCollapsed={false}
      >
        <p>Caret-only body</p>
      </DisclosureEntityCard>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article.style.getPropertyValue(ENTITY_CONTENT_OFFSET_VAR)).toContain(
      'calc(calc(var(--spacing)*6)',
    )
  })

  it('composes entity-card CLI behavior-only with a single leading rail and two columns', () => {
    const { container } = render(
      <DisclosureEntityCard
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
        defaultCollapsed={false}
      >
        <p>Combined invariant body</p>
      </DisclosureEntityCard>,
    )

    const leadingSlot = container.querySelector('[data-entity-item-slot="leading"]') as HTMLElement
    const rail = leadingSlot.querySelector('.flex.shrink-0.items-center.gap-0') as HTMLElement
    expect(rail).toBeTruthy()
    expect(rail).toHaveClass('pe-[calc(var(--spacing)*3)]')
    expect(leadingSlot.className).not.toMatch(/\bmr-/)
    expect(leadingSlot.querySelectorAll('[class*="w-[var(--leading-chrome-size)]"]')).toHaveLength(
      2,
    )

    const body = bodyFor('Combined invariant body')
    expect(body.className).not.toContain('content-column-indent')

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell.style.getPropertyValue('--content-column-indent')).toBe('')
  })
})
