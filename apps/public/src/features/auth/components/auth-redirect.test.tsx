import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthRedirect } from './auth-redirect.client'

const { useSession } = vi.hoisted(() => ({
  useSession: vi.fn(),
}))

vi.mock('../hooks/use-session', () => ({
  useSession,
}))

function renderRedirect(returnTo?: string) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthRedirect returnTo={returnTo}>
        <p>Auth form</p>
      </AuthRedirect>
    </QueryClientProvider>,
  )
}

describe('AuthRedirect', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { assign: vi.fn() })
  })

  it('shows a skeleton while the session is loading', () => {
    useSession.mockReturnValue({ isPending: true })

    const { container } = renderRedirect()

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.queryByText('Auth form')).not.toBeInTheDocument()
  })

  it('redirects authenticated users to the dashboard by default', () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'a@b.com', displayName: 'DM', role: 'user' },
        activeCampaign: null,
      },
    })

    renderRedirect()

    expect(window.location.assign).toHaveBeenCalledWith('/app/')
    expect(screen.queryByText('Auth form')).not.toBeInTheDocument()
  })

  it('redirects authenticated users to a validated returnTo path', () => {
    useSession.mockReturnValue({
      isPending: false,
      data: {
        user: { id: 'u1', email: 'a@b.com', displayName: 'DM', role: 'user' },
        activeCampaign: null,
      },
    })

    renderRedirect('/campaign-invites/token-1')

    expect(window.location.assign).toHaveBeenCalledWith('/campaign-invites/token-1')
  })

  it('renders children when unauthenticated', () => {
    useSession.mockReturnValue({ isPending: false, data: undefined })

    renderRedirect()

    expect(screen.getByText('Auth form')).toBeInTheDocument()
  })
})
