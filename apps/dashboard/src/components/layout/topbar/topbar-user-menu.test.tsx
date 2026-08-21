import { describe, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeSessionUser } from '@/test/fixtures/session'
import { TopbarUserMenu } from './topbar-user-menu'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('@/features/auth', () => ({
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

const user = makeSessionUser()

describe('TopbarUserMenu', () => {
  itAxe('has no axe violations when the menu is open', async () => {
    const view = render(<TopbarUserMenu user={user} />)
    await userEvent.click(screen.getByRole('button', { name: /dungeon master/i }))

    await expectNoAxeViolations(view.container)
  })
})
