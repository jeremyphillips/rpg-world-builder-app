import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../button.client'
import { Text } from '../text'
import { CollapsibleListItem } from './collapsible-list-item.client'
import { collapsibleListItemShellPaddingClasses } from './collapsible-list-item.variants'

describe('CollapsibleListItem', () => {
  it('renders header content and positions actions in the header row', () => {
    const { container } = render(
      <CollapsibleListItem
        itemId="alpha"
        titleId="alpha-title"
        toolbarAriaLabel="Alpha item"
        collapsible={false}
        collapsed={false}
        onToggleCollapse={vi.fn()}
        header={<span>Alpha header</span>}
        actions={<Button type="button">Add</Button>}
      />,
    )

    expect(screen.getByText('Alpha header')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('flex-col', collapsibleListItemShellPaddingClasses)
  })

  it('wires collapse button aria attributes and toggles expanded body', async () => {
    const user = userEvent.setup()
    const onToggleCollapse = vi.fn()

    render(
      <CollapsibleListItem
        itemId="beta"
        titleId="beta-title"
        toolbarAriaLabel="Beta item"
        collapsible
        collapsed
        onToggleCollapse={onToggleCollapse}
        header={<span>Beta header</span>}
        body={<p>Expanded details</p>}
      />,
    )

    const collapseButton = screen.getByRole('button', { name: 'Expand Beta item' })
    expect(collapseButton).toHaveAttribute('aria-expanded', 'false')
    expect(collapseButton).toHaveAttribute('aria-controls', 'beta-body')
    expect(screen.getByText('Expanded details').parentElement).toHaveAttribute('hidden')

    await user.click(collapseButton)
    expect(onToggleCollapse).toHaveBeenCalledTimes(1)
  })

  it('shows body content when expanded', () => {
    render(
      <CollapsibleListItem
        itemId="gamma"
        titleId="gamma-title"
        toolbarAriaLabel="Gamma item"
        collapsible
        collapsed={false}
        onToggleCollapse={vi.fn()}
        header={<span>Gamma header</span>}
        body={<p>Visible details</p>}
      />,
    )

    const body = screen.getByText('Visible details').parentElement
    expect(body).not.toHaveAttribute('hidden')
    expect(body).not.toHaveAttribute('aria-hidden', 'true')
  })

  it('centers actions on the title row when actionsAlign is center', () => {
    const { container } = render(
      <CollapsibleListItem
        itemId="epsilon"
        titleId="epsilon-title"
        toolbarAriaLabel="Epsilon item"
        collapsible
        collapsed={false}
        onToggleCollapse={vi.fn()}
        actionsAlign="center"
        header={<span>Epsilon header</span>}
        summary={<span>Warning badge</span>}
        body={<p>Expanded details</p>}
        actions={<Button type="button">Add</Button>}
      />,
    )

    const shell = container.firstChild as HTMLElement
    const headerRow = shell.firstElementChild as HTMLElement
    const addButton = screen.getByRole('button', { name: 'Add' })
    const body = screen.getByText('Expanded details').parentElement
    const summary = screen.getByText('Warning badge').parentElement

    expect(shell).toHaveClass('flex-col', collapsibleListItemShellPaddingClasses)
    expect(shell).not.toHaveClass('grid-cols-[minmax(0,1fr)_auto]')
    expect(headerRow).toHaveClass('flex', 'items-center')
    expect(headerRow.contains(addButton)).toBe(true)
    expect(summary).toHaveClass(
      'pl-[calc(var(--array-item-chrome-count)*var(--spacing)*6+min(1,var(--array-item-chrome-count))*var(--spacing))]',
    )
    expect(body).toHaveClass(
      'pl-[calc(var(--array-item-chrome-count)*var(--spacing)*6+min(1,var(--array-item-chrome-count))*var(--spacing))]',
    )
    expect(screen.getByRole('group', { name: 'Item actions' })).toBeInTheDocument()
  })

  it('defaults to centered actions when no drag handle is shown', () => {
    const { container } = render(
      <CollapsibleListItem
        itemId="zeta"
        titleId="zeta-title"
        toolbarAriaLabel="Zeta item"
        collapsible
        collapsed
        onToggleCollapse={vi.fn()}
        header={<span>Zeta header</span>}
        actions={<Button type="button">Add</Button>}
      />,
    )

    expect(container.firstChild).toHaveClass('flex-col', collapsibleListItemShellPaddingClasses)
  })

  it('applies catalog picker row surface tone on the shell', () => {
    const { container } = render(
      <CollapsibleListItem
        itemId="catalog-row"
        titleId="catalog-row-title"
        toolbarAriaLabel="Catalog row"
        preset="catalog"
        collapsible={false}
        collapsed={false}
        onToggleCollapse={vi.fn()}
        header={<span>Catalog header</span>}
      />,
    )

    const shell = container.firstChild
    expect(shell).toHaveClass('border-border', 'bg-catalog-picker-row-surface')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CollapsibleListItem
        itemId="delta"
        titleId="delta-title"
        toolbarAriaLabel="Delta item"
        collapsible
        collapsed={false}
        onToggleCollapse={vi.fn()}
        header={<Text>Delta header</Text>}
        summary={<Text variant="muted">Summary line</Text>}
        body={<p>Detail body</p>}
        actions={<Button type="button">Remove</Button>}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
