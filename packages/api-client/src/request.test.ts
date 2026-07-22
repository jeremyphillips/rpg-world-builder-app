import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@rpg/contracts'

import { postJson, request } from './request'

function fakeResponse(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body } as unknown as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => fakeResponse(true, 200, { ok: true })),
    )

    await expect(request('/api/health')).resolves.toEqual({ ok: true })
    expect(fetch).toHaveBeenCalledWith('/api/health', { credentials: 'include' })
  })

  it('throws ApiError with the server message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        fakeResponse(false, 401, { error: { code: 'unauthorized', message: 'Nope.' } }),
      ),
    )

    const err = await request('/api/auth/me', undefined, 'Not authenticated.').catch(
      (e: unknown) => e,
    )
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 401, message: 'Nope.' })
  })

  it('preserves validation details on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        fakeResponse(false, 400, {
          error: {
            code: 'validation_error',
            message: 'Incomplete',
            details: { issues: [{ path: 'name', message: 'Required' }] },
          },
        }),
      ),
    )

    const err = await request('/api/example').catch((e: unknown) => e)
    expect(err).toMatchObject({
      status: 400,
      code: 'validation_error',
      details: { issues: [{ path: 'name', message: 'Required' }] },
    })
  })
})

describe('postJson', () => {
  it('fetches a CSRF token and sends a JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/api/auth/csrf')) return fakeResponse(true, 200, { csrfToken: 'tok' })
        return fakeResponse(true, 200, { user: { id: 'u1' } })
      }),
    )

    await expect(postJson('/api/auth/login', { email: 'a@b.com' })).resolves.toEqual({
      user: { id: 'u1' },
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({ 'x-csrf-token': 'tok' }),
      }),
    )
  })
})
