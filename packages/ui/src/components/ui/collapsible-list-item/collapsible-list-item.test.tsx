import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../button.client'
import { Text } from '../text'
import { CollapsibleListItem } from './collapsible-list-item.client'

describe('CollapsibleListItem', () => {
  it('renders header content and positions actions in the shell grid', () => {
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
    expect(container.firstChild).toHaveClass('grid-cols-[minmax(0,1fr)_auto]')
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
