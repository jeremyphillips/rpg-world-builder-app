import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

vi.mock('@/features/auth', () => ({
  useSession: vi.fn(),
  useIsElevatedPlatformRole: vi.fn(),
}))

import { useSession, useIsElevatedPlatformRole } from '@/features/auth'
import { renderWithProviders } from '@/test/render'
import { AdminRouteGuard } from './admin-route-guard'

const mockUseSession = vi.mocked(useSession)
const mockUseIsElevatedPlatformRole = vi.mocked(useIsElevatedPlatformRole)

function renderGuard(initialEntry = '/admin/users') {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<div>home</div>} />
      <Route path="/admin" element={<AdminRouteGuard />}>
        <Route path="users" element={<div>admin users</div>} />
      </Route>
    </Routes>,
    { initialEntries: [initialEntry] },
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
