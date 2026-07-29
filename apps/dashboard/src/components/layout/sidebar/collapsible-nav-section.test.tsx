/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { CollapsibleNavSection } from './collapsible-nav-section.client'
import { NavItem } from './nav-item'

describe('CollapsibleNavSection', () => {
  it('reflects aria-expanded from the controlled expanded prop', () => {
    renderWithProviders(
      <CollapsibleNavSection label="Campaign" expanded onExpandedChange={() => undefined}>
        <NavItem to="/campaigns/demo" label="Overview" end />
      </CollapsibleNavSection>,
    )

    expect(screen.getByRole('button', { name: 'Campaign' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('calls onExpandedChange when toggled', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()

    renderWithProviders(
      <CollapsibleNavSection label="Campaign" expanded onExpandedChange={onExpandedChange}>
        <NavItem to="/campaigns/demo" label="Overview" end />
      </CollapsibleNavSection>,
    )

    await user.click(screen.getByRole('button', { name: 'Campaign' }))
    expect(onExpandedChange).toHaveBeenCalledWith(false)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <CollapsibleNavSection label="Campaign" expanded onExpandedChange={() => undefined}>
        <NavItem to="/campaigns/demo" label="Overview" end />
      </CollapsibleNavSection>,
    )

    await expectNoAxeViolations(container)
  })
})
