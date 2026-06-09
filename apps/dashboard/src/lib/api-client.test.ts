import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@rpg/contracts'

import { postJson, request, uploadFile } from './api-client'

function fakeResponse(ok: boolean, status: number, body: unknown, throwOnJson = false) {
  return {
    ok,
    status,
    json: async () => {
      if (throwOnJson) throw new Error('invalid json')
      return body
    },
  } as unknown as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('request', () => {
  it('returns the parsed body on a 2xx response', async () => {
    const fetchMock = vi.fn(async () => fakeResponse(true, 200, { value: 42 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(request<{ value: number }>('/api/thing')).resolves.toEqual({ value: 42 })
    expect(fetchMock).toHaveBeenCalledWith('/api/thing', { credentials: 'include' })
  })

  it('throws ApiError carrying the server code and message on a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => fakeResponse(false, 400, { error: { code: 'bad', message: 'Nope.' } })),
    )

    const err = await request('/api/thing').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 400, code: 'bad', message: 'Nope.' })
  })

  it('falls back to the provided message when the error body is unparseable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => fakeResponse(false, 500, null, true)),
    )

    await expect(request('/api/thing', undefined, 'Custom fallback.')).rejects.toThrow(
      'Custom fallback.',
    )
  })
})

describe('uploadFile', () => {
  it('fetches a CSRF token, then POSTs multipart form data with the file field', async () => {
    let uploadBody: FormData | undefined
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/api/auth/csrf')) return fakeResponse(true, 200, { csrfToken: 'tok-123' })
      uploadBody = init?.body as FormData
      return fakeResponse(true, 201, { key: 'abc-123.jpg' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File(['img'], 'avatar.png', { type: 'image/png' })
    await expect(uploadFile(file)).resolves.toBe('abc-123.jpg')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/uploads',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
        headers: { 'x-csrf-token': 'tok-123' },
      }),
    )
    expect(uploadBody).toBeInstanceOf(FormData)
    expect(uploadBody?.get('file')).toBe(file)
  })
})

describe('postJson', () => {
  it('fetches a CSRF token, then POSTs the JSON body with the CSRF header', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('/api/auth/csrf')) return fakeResponse(true, 200, { csrfToken: 'tok-123' })
      return fakeResponse(true, 201, { ok: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(postJson('/api/campaigns', { name: 'X' })).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenLastCalledWith('/api/campaigns', {
      credentials: 'include',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': 'tok-123' },
      body: JSON.stringify({ name: 'X' }),
    })
  })
})
