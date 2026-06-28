import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, defaultCampaignMechanicsPatch } from '@rpg/contracts'

import { fetchRulesetPatch, patchCharacterCreation, patchMechanics } from './ruleset-patch-api'

function fakeResponse(ok: boolean, status: number, body: unknown) {
  return { ok, status, json: async () => body } as unknown as Response
}

function stubFetch(response: Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (url.includes('/api/auth/csrf')) return fakeResponse(true, 200, { csrfToken: 'tok' })
      return response
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchRulesetPatch', () => {
  it('unwraps and returns the patch on success', async () => {
    const patch = {
      characterCreation: {
        startingLevel: 1,
        importedCharacters: { policy: 'disabled' },
        progression: { maxCharacterLevel: 20 },
        species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
      },
      mechanics: defaultCampaignMechanicsPatch(),
    }
    stubFetch(fakeResponse(true, 200, { patch }))

    await expect(fetchRulesetPatch('c1')).resolves.toEqual(patch)
  })

  it('throws ApiError with the server message when the request fails', async () => {
    stubFetch(fakeResponse(false, 404, { error: { code: 'not_found', message: 'Missing.' } }))

    const err = await fetchRulesetPatch('c1').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err).toMatchObject({ status: 404, message: 'Missing.' })
  })
})

describe('patchCharacterCreation', () => {
  it('unwraps and returns the updated patch on success', async () => {
    const patch = {
      characterCreation: {
        startingLevel: 3,
        importedCharacters: { policy: 'disabled' },
        progression: { maxCharacterLevel: 20 },
        species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
      },
      mechanics: defaultCampaignMechanicsPatch(),
    }
    stubFetch(fakeResponse(true, 200, { patch }))

    await expect(patchCharacterCreation('c1', { startingLevel: 3 })).resolves.toEqual(patch)
  })

  it('falls back to a default message when the error body is missing', async () => {
    stubFetch(fakeResponse(false, 500, null))

    await expect(patchCharacterCreation('c1', { startingLevel: 3 })).rejects.toThrow(
      'Could not update character creation rules.',
    )
  })
})

describe('patchMechanics', () => {
  it('unwraps and returns the updated patch on success', async () => {
    const patch = {
      characterCreation: {
        startingLevel: 1,
        importedCharacters: { policy: 'disabled' },
        progression: { maxCharacterLevel: 20 },
        species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
      },
      mechanics: {
        ...defaultCampaignMechanicsPatch(),
        editionPreset: { id: '3e' as const, modified: false },
      },
    }
    stubFetch(fakeResponse(true, 200, { patch }))

    await expect(
      patchMechanics('c1', {
        editionPreset: { id: '3e' },
        armorClass: { mode: 'ascending', base: 10 },
        attackResolution: { mode: 'attack_bonus_vs_target_ac' },
      }),
    ).resolves.toEqual(patch)
  })

  it('falls back to a default message when the error body is missing', async () => {
    stubFetch(fakeResponse(false, 500, null))

    await expect(patchMechanics('c1', { editionPreset: { id: '5e' } })).rejects.toThrow(
      'Could not update mechanics rules.',
    )
  })
})
