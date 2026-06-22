import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchSession, logout } from './auth'

function fakeResponse(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body } as unknown as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchSession', () => {
  it('returns the auth me payload on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        fakeResponse(true, 200, {
          user: { id: 'u1', lastSelectedCampaignId: null },
          activeCampaign: null,
        }),
      ),
    )

    await expect(fetchSession()).resolves.toEqual({
      user: { id: 'u1', lastSelectedCampaignId: null },
      activeCampaign: null,
    })
  })
})

describe('logout', () => {
  it('posts to /api/auth/logout with a CSRF header', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/api/auth/csrf')) return fakeResponse(true, 200, { csrfToken: 'tok' })
        return fakeResponse(true, 200, { ok: true })
      }),
    )

    await logout()

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'x-csrf-token': 'tok' }),
      }),
    )
  })
})
