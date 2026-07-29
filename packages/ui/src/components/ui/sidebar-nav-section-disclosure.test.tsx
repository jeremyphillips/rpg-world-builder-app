/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { render } from '@testing-library/react'

import { SidebarNavSectionDisclosure } from './sidebar-nav-section-disclosure.client'

describe('SidebarNavSectionDisclosure', () => {
  it('reflects aria-expanded from the controlled expanded prop', () => {
    render(
      <SidebarNavSectionDisclosure label="Campaign" expanded onExpandedChange={() => undefined}>
        <a href="/campaigns/demo">Overview</a>
      </SidebarNavSectionDisclosure>,
    )

    expect(screen.getByRole('button', { name: 'Campaign' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('calls onExpandedChange when toggled', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()

    render(
      <SidebarNavSectionDisclosure label="Campaign" expanded onExpandedChange={onExpandedChange}>
        <a href="/campaigns/demo">Overview</a>
      </SidebarNavSectionDisclosure>,
    )

    await user.click(screen.getByRole('button', { name: 'Campaign' }))
    expect(onExpandedChange).toHaveBeenCalledWith(false)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SidebarNavSectionDisclosure label="Campaign" expanded onExpandedChange={() => undefined}>
        <a href="/campaigns/demo">Overview</a>
      </SidebarNavSectionDisclosure>,
    )

    await expectNoAxeViolations(container)
  })
})
