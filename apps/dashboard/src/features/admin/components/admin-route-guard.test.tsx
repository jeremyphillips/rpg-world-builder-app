import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('@/features/auth', () => ({
  useSession: vi.fn(),
  useIsElevatedPlatformRole: vi.fn(),
}))

import { useSession, useIsElevatedPlatformRole } from '@/features/auth'
import { AdminRouteGuard } from './admin-route-guard'

const mockUseSession = vi.mocked(useSession)
const mockUseIsElevatedPlatformRole = vi.mocked(useIsElevatedPlatformRole)

function renderGuard(initialEntry = '/admin/users') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<div>home</div>} />
          <Route path="/admin" element={<AdminRouteGuard />}>
            <Route path="users" element={<div>admin users</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminRouteGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a spinner while the session is loading', () => {
    mockUseSession.mockReturnValue({ isPending: true } as ReturnType<typeof useSession>)
    mockUseIsElevatedPlatformRole.mockReturnValue(false)

    renderGuard()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('redirects non-elevated users to home', () => {
    mockUseSession.mockReturnValue({ isPending: false } as ReturnType<typeof useSession>)
    mockUseIsElevatedPlatformRole.mockReturnValue(false)

    renderGuard()

    expect(screen.getByText('home')).toBeInTheDocument()
    expect(screen.queryByText('admin users')).not.toBeInTheDocument()
  })

  it('renders child routes for elevated users', () => {
    mockUseSession.mockReturnValue({ isPending: false } as ReturnType<typeof useSession>)
    mockUseIsElevatedPlatformRole.mockReturnValue(true)

    renderGuard()

    expect(screen.getByText('admin users')).toBeInTheDocument()
  })
})
