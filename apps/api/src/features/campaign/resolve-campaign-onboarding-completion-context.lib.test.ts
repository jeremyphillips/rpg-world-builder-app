import { describe, expect, it, vi } from 'vitest'

import { HttpError } from '../../lib/http-error'
import { resolveCampaignOnboardingCompletionContext } from './resolve-campaign-onboarding-completion-context.lib'
import { loadCampaignViewerParticipationContext } from './resolve-campaign-viewer-participation-context.lib'

vi.mock('./resolve-campaign-viewer-participation-context.lib', () => ({
  loadCampaignViewerParticipationContext: vi.fn(),
}))

const mockedLoadParticipation = vi.mocked(loadCampaignViewerParticipationContext)

describe('resolveCampaignOnboardingCompletionContext', () => {
  it('returns the first active character idempotently for source:new without conflict check', async () => {
    mockedLoadParticipation.mockResolvedValue({
      membershipId: 'mem_1',
      role: 'pc',
      controlledCharacterIds: ['char_primary', 'char_other'],
      participationState: 'active',
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
    mockedLoadParticipation.mockResolvedValue({
      membershipId: 'mem_1',
      role: 'pc',
      controlledCharacterIds: ['char_primary', 'char_other'],
      participationState: 'active',
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
})
