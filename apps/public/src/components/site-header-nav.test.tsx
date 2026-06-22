import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SiteHeaderNav } from './site-header-nav.client'

const { useSession } = vi.hoisted(() => ({
  useSession: vi.fn(),
}))

vi.mock('@/features/auth', () => ({
  useSession,
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

function renderNav() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <SiteHeaderNav />
    </QueryClientProvider>,
  )
}

describe('SiteHeaderNav', () => {
  it('shows a skeleton while the session is loading', () => {
    useSession.mockReturnValue({ isPending: true })

    const { container } = renderNav()

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /log in/i })).not.toBeInTheDocument()
  })

  it('shows login and signup links when unauthenticated', () => {
    useSession.mockReturnValue({ isPending: false, data: undefined })

    renderNav()

    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup')
  })

  it('shows the user menu when authenticated', () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: {
          id: 'u1',
          email: 'dm@example.com',
          displayName: 'Dungeon Master',
          role: 'user',
          lastSelectedCampaignId: null,
        },
        activeCampaign: null,
      },
    })

    renderNav()

    expect(screen.getByRole('button', { name: /dungeon master/i })).toBeInTheDocument()
  })
})
