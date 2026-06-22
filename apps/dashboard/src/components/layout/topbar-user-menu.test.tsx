import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { TopbarUserMenu } from './topbar-user-menu'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

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

describe('TopbarUserMenu', () => {
  it('has no axe violations when the menu is open', async () => {
    const view = render(<TopbarUserMenu user={user} />)
    await userEvent.click(screen.getByRole('button', { name: /dungeon master/i }))

    const { violations } = await axe.run(view.container)
    expect(violations).toHaveLength(0)
  })
})
