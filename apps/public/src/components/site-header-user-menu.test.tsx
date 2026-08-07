import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { SiteHeaderUserMenu } from './site-header-user-menu.client'

vi.mock('@/features/auth', () => ({
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

const user = {
  id: 'u1',
  email: 'dm@example.com',
  displayName: 'Dungeon Master',
  role: 'user' as const,
  lastSelectedCampaignId: null,
}

describe('SiteHeaderUserMenu', () => {
  itAxe('has no axe violations when the menu is open', async () => {
    const view = render(
      <SiteHeaderUserMenu user={user} activeCampaign={{ id: 'c1', name: 'Sunless Citadel' }} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /dungeon master/i }))

    await expectNoAxeViolations(view.container)
  })

  it('shows the active campaign when one is set', async () => {
    render(
      <SiteHeaderUserMenu user={user} activeCampaign={{ id: 'c1', name: 'Sunless Citadel' }} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /dungeon master/i }))

    expect(screen.getByText('Active campaign')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /sunless citadel/i })).toHaveAttribute(
      'href',
      '/app/campaigns/c1',
    )
  })

  it('omits the active campaign block when none is set', async () => {
    render(<SiteHeaderUserMenu user={user} activeCampaign={null} />)
    await userEvent.click(screen.getByRole('button', { name: /dungeon master/i }))

    expect(screen.queryByText('Active campaign')).not.toBeInTheDocument()
  })

  it('links to dashboard routes for navigation items', async () => {
    render(<SiteHeaderUserMenu user={user} activeCampaign={null} />)
    await userEvent.click(screen.getByRole('button', { name: /dungeon master/i }))

    expect(screen.getByRole('menuitem', { name: /dashboard/i })).toHaveAttribute('href', '/app/')
    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute(
      'href',
      '/app/profile',
    )
    expect(screen.getByRole('menuitem', { name: /account settings/i })).toHaveAttribute(
      'href',
      '/app/account',
    )
  })
})
