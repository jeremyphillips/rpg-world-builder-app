import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { SessionUser } from '@rpg/contracts'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('@/features/auth/api/auth-client')

import { fetchSession as fetchSessionFn } from '@/features/auth/api/auth-client'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'
import { useIsElevatedPlatformRole } from './use-is-elevated-platform-role'

const fetchSession = vi.mocked(fetchSessionFn)

function makeUser(role: SessionUser['role']): SessionUser {
  return makeSessionUser({ email: 'user@example.com', displayName: 'Test User', role })
}

describe('useIsElevatedPlatformRole', () => {
  beforeEach(() => {
    fetchSession.mockReset()
  })

  it('returns false while the session is loading', () => {
    fetchSession.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useIsElevatedPlatformRole(), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current).toBe(false)
  })

  it('returns false for a standard user role', async () => {
    fetchSession.mockResolvedValue(makeAuthMe(makeUser('user')))

    const { result } = renderHook(() => useIsElevatedPlatformRole(), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it.each(['admin', 'superadmin'] as const)('returns true for %s role', async (role) => {
    fetchSession.mockResolvedValue(makeAuthMe(makeUser(role)))

    const { result } = renderHook(() => useIsElevatedPlatformRole(), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })
})
