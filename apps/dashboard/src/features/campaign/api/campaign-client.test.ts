import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@rpg/contracts'

import { createCampaign } from './campaign-client'

function fakeResponse(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body } as unknown as Response
}

function stubFetch(campaignResponse: Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/api/auth/csrf')) return fakeResponse(true, 200, { csrfToken: 'tok' })
      return campaignResponse
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createCampaign', () => {
  it('unwraps and returns the created campaign on success', async () => {
    stubFetch(fakeResponse(true, 201, { campaign: { id: 'c1' } }))

    await expect(createCampaign({ name: 'The Sunless Citadel' })).resolves.toEqual({ id: 'c1' })
  })

  it('throws ApiError with the server message when the request fails', async () => {
    stubFetch(
      fakeResponse(false, 400, { error: { code: 'validation', message: 'Name is required.' } }),
    )

    const err = await createCampaign({ name: '' }).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 400, message: 'Name is required.' })
  })

  it('falls back to a default message when the error body is missing', async () => {
    stubFetch(fakeResponse(false, 500, null))

    await expect(createCampaign({ name: 'X' })).rejects.toThrow('Could not create campaign.')
  })
})
