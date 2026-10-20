import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import { ActionIcon, iconGhostControlVariants } from '@rpg/ui'

import { EntityCardDisclosureRenderer } from '../entity-card-disclosure-renderer'
import { DASH_ENTITY_CARD_BODY_CLASS } from '../../../dash-entity-surface.variants'
import { HARBOR_DISTRICT_ENTITY } from '../../../../__tests__/entity.fixture'

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

function ghostRemoveUtility(label: string) {
  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'accent', layout: 'flex' })}
      aria-label={`Remove ${label}`}
    >
      <ActionIcon action="remove" step="md" />
    </button>
  )
}

describe('EntityCardDisclosureRenderer', () => {
  it('renders entity identity and hides body when collapsed by default', () => {
    render(
      <MemoryRouter>
        <EntityCardDisclosureRenderer
          itemId="harbor"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          headingHref="/campaigns/demo/locations/harbor"
        >
          <p>Expanded inventory details</p>
        </EntityCardDisclosureRenderer>
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
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        defaultCollapsed={false}
      >
        <p>Expanded inventory details</p>
      </EntityCardDisclosureRenderer>,
    )

    const body = screen.getByText('Expanded inventory details').parentElement
    expect(body).not.toHaveAttribute('hidden')
    expect(body).toHaveClass('border-t', 'bg-background')
    expect(body).toHaveClass(DASH_ENTITY_CARD_BODY_CLASS)

    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('dash-entity-surface--leading-1')
    expect(article).toHaveClass('dash-entity-surface--start-utility')
    expect(article).toHaveClass('dash-entity-surface--end-default')
    expect(article).not.toHaveAttribute('style')

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell.className).not.toContain('--entity-surface-inline-start')
  })

  it('keeps body inline-end inset identical regardless of trailing action width', () => {
    const cases = [
      { id: 'none', trailing: undefined, label: 'Body none' },
      {
        id: 'utility-remove',
        trailing: { kind: 'utility' as const, content: ghostRemoveUtility('Body utility') },
        label: 'Body utility remove',
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
          <EntityCardDisclosureRenderer
            key={entry.id}
            itemId={entry.id}
            toolbarAriaLabel={entry.id}
            entity={HARBOR_DISTRICT_ENTITY}
            trailing={entry.trailing}
            density="compact"
            defaultCollapsed={false}
          >
            <p>{entry.label}</p>
          </EntityCardDisclosureRenderer>
        ))}
      </div>,
    )

    const classNames = cases.map((entry) => bodyFor(entry.label).className)
    for (const className of classNames) {
      expect(className).toContain(DASH_ENTITY_CARD_BODY_CLASS)
    }
    expect(new Set(classNames).size).toBe(1)
  })

  it('publishes compact surface inset tokens and utility end inset for ghost trailing', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        density="compact"
        trailing={{ kind: 'utility', content: ghostRemoveUtility('Harbor District') }}
        defaultCollapsed={false}
      >
        <p>Compact body</p>
      </EntityCardDisclosureRenderer>,
    )

    const shell = container.querySelector('[role="group"]') as HTMLElement
    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('dash-entity-surface--compact')
    expect(article).toHaveClass('dash-entity-surface--start-utility')
    expect(article).toHaveClass('dash-entity-surface--end-utility')
    expect(shell.className).not.toContain('--entity-surface-inline-start')
    expect(bodyFor('Compact body')).toHaveClass(DASH_ENTITY_CARD_BODY_CLASS)
  })

  it('toggles collapse from the caret control', async () => {
    const user = userEvent.setup()
    const onToggleCollapse = vi.fn()

    render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        collapsed
        onToggleCollapse={onToggleCollapse}
      >
        <p>Expanded inventory details</p>
      </EntityCardDisclosureRenderer>,
    )

    await user.click(screen.getByRole('button', { name: 'Expand Harbor District' }))
    expect(onToggleCollapse).toHaveBeenCalledOnce()
  })

  it('uses equal-width leading chrome columns for grip and caret', () => {
    render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
      >
        <p>Expanded inventory details</p>
      </EntityCardDisclosureRenderer>,
    )

    const expandButton = screen.getByRole('button', { name: 'Expand Harbor District' })
    const dragButton = screen.getByRole('button', { name: 'Drag to reorder Harbor District' })

    expect(expandButton.parentElement).toHaveClass('dash-entity-leading__column')
    expect(dragButton.parentElement).toHaveClass('dash-entity-leading__column')
  })

  it('renders caret-only leading chrome when drag is omitted', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
      >
        <p>Expanded inventory details</p>
      </EntityCardDisclosureRenderer>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('dash-entity-surface--leading-1')
    expect(screen.getByRole('button', { name: 'Expand Harbor District' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/drag to reorder/i)).not.toBeInTheDocument()
  })

  it('applies presentational disabled treatment on the outer shell', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        disabled
      >
        <p>Expanded inventory details</p>
      </EntityCardDisclosureRenderer>,
    )

    const article = container.querySelector('article')
    expect(article).toHaveAttribute('data-disabled', 'true')
    expect(article).toHaveClass('ui-card--disabled')
  })

  it('owns quiet card fill independent of parent host surfaces', () => {
    const { container } = render(
      <div className="bg-surface-muted">
        <EntityCardDisclosureRenderer
          itemId="harbor"
          toolbarAriaLabel="Harbor District"
          entity={HARBOR_DISTRICT_ENTITY}
          defaultCollapsed={false}
        >
          <p>Expanded inventory details</p>
        </EntityCardDisclosureRenderer>
      </div>,
    )

    const article = container.querySelector('article')
    expect(article).toHaveClass('ui-card--quiet')
    expect(article?.className).not.toContain('bg-surface-muted')
  })

  it('forwards trailing seam to EntityAnatomyHost anatomy', () => {
    render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        trailing={{ kind: 'utility', content: ghostRemoveUtility('Harbor District') }}
        defaultCollapsed={false}
      >
        <p>Expanded inventory details</p>
      </EntityCardDisclosureRenderer>,
    )

    expect(screen.getByRole('button', { name: 'Remove Harbor District' })).toBeInTheDocument()
  })

  it('fills the header region so short-heading trailing aligns to column 3', () => {
    const { container } = render(
      <div className="w-[480px]">
        <EntityCardDisclosureRenderer
          itemId="short-heading"
          toolbarAriaLabel="Harbor District"
          entity={{ heading: 'Light' }}
          density="compact"
          trailing={{ kind: 'utility', content: ghostRemoveUtility('Light') }}
          defaultCollapsed={false}
        >
          <p>Body</p>
        </EntityCardDisclosureRenderer>
      </div>,
    )

    const headerWrap = screen
      .getByText('Light', { selector: '.font-body-emphasis' })
      .closest('.dash-entity-card__content') as HTMLElement
    const anatomy = headerWrap.querySelector('[data-row-anatomy]') as HTMLElement
    const trailing = container.querySelector('[data-entity-item-slot="trailing"]') as HTMLElement
    const content = container.querySelector('[data-entity-item-slot="content"]') as HTMLElement

    expect(headerWrap).toHaveClass('dash-entity-card__content')
    expect(anatomy).toHaveClass('w-full')
    expect(anatomy).toHaveAttribute('data-row-anatomy')
    expect(content).toHaveAttribute('data-row-anatomy-column', 'content')
    expect(trailing).toHaveAttribute('data-row-anatomy-column', 'trailing')
    expect(trailing).toHaveAttribute('data-row-anatomy-slot', 'full')
    expect(trailing.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_PRECEDING)
  })

  it('keeps trailing in column 3 when heading and description wrap', () => {
    const { container } = render(
      <div className="w-[320px]">
        <EntityCardDisclosureRenderer
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
          trailing={{ kind: 'utility', content: ghostRemoveUtility('Speak with Animals') }}
          defaultCollapsed={false}
        >
          <p>Body</p>
        </EntityCardDisclosureRenderer>
      </div>,
    )

    const content = container.querySelector('[data-entity-item-slot="content"]') as HTMLElement
    const trailing = container.querySelector('[data-entity-item-slot="trailing"]') as HTMLElement
    const anatomy = content.parentElement as HTMLElement

    expect(anatomy).toHaveClass('w-full')
    expect(trailing).toHaveAttribute('data-row-anatomy-slot', 'full')
    expect(content).toHaveClass('ui-row-anatomy__cell')
    expect(content).toHaveAttribute('data-row-anatomy-column', 'content')
    expect(trailing).toHaveAttribute('data-row-anatomy-column', 'trailing')
    expect(container.querySelector('[data-entity-item-slot="description"]')).toHaveAttribute(
      'data-row-anatomy-slot',
      'meta',
    )
    expect(
      screen.getByText(/Character has Speak with Animals always prepared/i),
    ).toBeInTheDocument()
  })

  it('does not merge legacy CLI body inset when rowLayout is entity-card', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
        density="compact"
        defaultCollapsed={false}
      >
        <p>Isolated body</p>
      </EntityCardDisclosureRenderer>,
    )

    const body = bodyFor('Isolated body')
    expect(body).toHaveClass(DASH_ENTITY_CARD_BODY_CLASS)
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
      .closest('.dash-entity-card__content') as HTMLElement
    expect(headerWrap).toHaveClass('dash-entity-card__content')
  })

  it('matches leading offset to grip+caret count on the article root', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
        defaultCollapsed={false}
      >
        <p>Grip and caret body</p>
      </EntityCardDisclosureRenderer>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('dash-entity-surface--leading-2')
  })

  it('matches leading offset to caret-only count on the article root', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        defaultCollapsed={false}
      >
        <p>Caret-only body</p>
      </EntityCardDisclosureRenderer>,
    )

    const article = container.querySelector('article') as HTMLElement
    expect(article).toHaveClass('dash-entity-surface--leading-1')
  })

  it('composes entity-card CLI behavior-only with a single leading rail and two columns', () => {
    const { container } = render(
      <EntityCardDisclosureRenderer
        itemId="harbor"
        toolbarAriaLabel="Harbor District"
        entity={HARBOR_DISTRICT_ENTITY}
        dragHandleProps={mockDragHandleProps}
        defaultCollapsed={false}
      >
        <p>Combined invariant body</p>
      </EntityCardDisclosureRenderer>,
    )

    const leadingSlot = container.querySelector('[data-entity-item-slot="leading"]') as HTMLElement
    const rail = leadingSlot.querySelector('.dash-entity-leading') as HTMLElement
    expect(rail).toBeTruthy()
    expect(rail).toHaveClass('dash-entity-leading--comfortable')
    expect(leadingSlot.className).not.toMatch(/\bmr-/)
    expect(leadingSlot.querySelectorAll('.dash-entity-leading__column')).toHaveLength(2)

    const body = bodyFor('Combined invariant body')
    expect(body.className).not.toContain('content-column-indent')

    const shell = container.querySelector('[role="group"]') as HTMLElement
    expect(shell.style.getPropertyValue('--content-column-indent')).toBe('')
  })
})
