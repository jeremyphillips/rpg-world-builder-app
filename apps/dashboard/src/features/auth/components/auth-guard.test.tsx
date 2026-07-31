import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ReactNode } from 'react'
import { screen, waitFor } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

vi.mock('../api/auth-client')
vi.mock('@/features/realtime', () => ({
  RealtimeProvider: ({ children }: { children: ReactNode }) => children,
}))

import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'
import { renderWithProviders } from '@/test/render'
import { fetchSession as fetchSessionFn } from '../api/auth-client'
import { AuthGuard } from './auth-guard'

const fetchSession = vi.mocked(fetchSessionFn)

function renderGuard() {
  return renderWithProviders(
    <Routes>
      <Route element={<AuthGuard />}>
        <Route index element={<div>protected content</div>} />
      </Route>
    </Routes>,
  )
}

describe('AuthGuard', () => {
  const originalLocation = window.location
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchSession.mockReset()
    // jsdom's window.location.assign can't be spied directly, so swap the
    // whole location object for the duration of the test.
    assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    })
  })

  it('redirects to /login when the session check fails (401)', async () => {
    fetchSession.mockRejectedValueOnce(new Error('unauthorized'))

    renderGuard()

    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith('/login')
    })
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
  })

  it('renders the protected content for an authenticated session', async () => {
    fetchSession.mockResolvedValueOnce(makeAuthMe(makeSessionUser({ id: '1' })))

    renderGuard()

    expect(await screen.findByText('protected content')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
  })
})
