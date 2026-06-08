import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const { fetchSession } = vi.hoisted(() => ({ fetchSession: vi.fn() }))

vi.mock('../api/auth-client', () => ({
  fetchSession,
  LOGIN_PATH: '/login',
}))

import { AuthGuard } from './auth-guard'

function renderGuard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route index element={<div>protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
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
    fetchSession.mockResolvedValueOnce({
      id: '1',
      email: 'dm@example.com',
      displayName: 'Dungeon Master',
      role: 'user',
    })

    renderGuard()

    expect(await screen.findByText('protected content')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
  })
})
