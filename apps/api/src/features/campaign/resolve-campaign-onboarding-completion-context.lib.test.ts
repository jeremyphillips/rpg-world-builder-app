import { describe, expect, it, vi } from 'vitest'

import { HttpError } from '../../lib/http-error'
import { loadCampaignOnboardingGate } from './load-campaign-onboarding-gate.lib'
import { resolveCampaignOnboardingCompletionContext } from './resolve-campaign-onboarding-completion-context.lib'

vi.mock('./load-campaign-onboarding-gate.lib', () => ({
  loadCampaignOnboardingGate: vi.fn(),
}))

const mockedLoadGate = vi.mocked(loadCampaignOnboardingGate)

describe('resolveCampaignOnboardingCompletionContext', () => {
  it('returns the first active character idempotently for source:new without conflict check', async () => {
    mockedLoadGate.mockResolvedValue({
      kind: 'complete',
      campaignId: 'camp_1',
      characterId: 'char_primary',
      activeCharacterIds: ['char_primary', 'char_other'],
    })

    await expect(
      resolveCampaignOnboardingCompletionContext({
        campaignId: 'camp_1',
        userId: 'user_1',
        characterSource: { kind: 'new' },
      }),
    ).resolves.toEqual({
      kind: 'idempotent',
      result: { campaignId: 'camp_1', characterId: 'char_primary' },
    })
  })

  it('rejects source:existing retries when onboarding was completed with a different character', async () => {
    mockedLoadGate.mockResolvedValue({
      kind: 'complete',
      campaignId: 'camp_1',
      characterId: 'char_primary',
      activeCharacterIds: ['char_primary', 'char_other'],
    })

    await expect(
      resolveCampaignOnboardingCompletionContext({
        campaignId: 'camp_1',
        userId: 'user_1',
        characterSource: { kind: 'existing', characterId: 'char_missing' },
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(HttpError)
      expect((error as HttpError).status).toBe(409)
      expect((error as HttpError).code).toBe('conflict')
      return true
    })
  })

  it('returns ready context for eligible initial gate results', async () => {
    mockedLoadGate.mockResolvedValue({
      kind: 'eligible',
      campaignId: 'camp_1',
      membershipId: 'mem_1',
      mode: 'initial',
    })

    await expect(
      resolveCampaignOnboardingCompletionContext({
        campaignId: 'camp_1',
        userId: 'user_1',
        characterSource: { kind: 'existing', characterId: 'char_1' },
      }),
    ).resolves.toEqual({
      kind: 'ready',
      context: { campaignId: 'camp_1', membershipId: 'mem_1' },
    })
  })

  it('maps gate integrity_error to HTTP 500', async () => {
    mockedLoadGate.mockResolvedValue({
      kind: 'integrity_error',
      reason: 'ready_pc_without_active_character',
    })

    await expect(
      resolveCampaignOnboardingCompletionContext({
        campaignId: 'camp_1',
        userId: 'user_1',
        characterSource: { kind: 'new' },
      }),
    ).rejects.toMatchObject({
      status: 500,
      code: 'integrity_error',
    })
  })
})
