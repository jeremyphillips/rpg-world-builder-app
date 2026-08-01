import { describe, expect, it, vi } from 'vitest'

import { loadCampaignOnboardingGate } from './load-campaign-onboarding-gate.lib'
import { findCampaignById } from './find-campaign-by-id'
import { loadCampaignViewerParticipationContext } from './resolve-campaign-viewer-participation-context.lib'

vi.mock('./find-campaign-by-id', () => ({
  findCampaignById: vi.fn(),
}))

vi.mock('./resolve-campaign-viewer-participation-context.lib', () => ({
  loadCampaignViewerParticipationContext: vi.fn(),
}))

const mockedFindCampaign = vi.mocked(findCampaignById)
const mockedLoadParticipation = vi.mocked(loadCampaignViewerParticipationContext)

describe('loadCampaignOnboardingGate', () => {
  it('returns not_found when the campaign does not exist', async () => {
    mockedFindCampaign.mockResolvedValue(null)

    await expect(
      loadCampaignOnboardingGate({ campaignId: 'camp_missing', userId: 'user_1' }),
    ).resolves.toEqual({ kind: 'not_found' })
  })

  it('returns forbidden for staff memberships', async () => {
    mockedFindCampaign.mockResolvedValue({
      id: 'camp_1',
      identity: { name: 'Staff Campaign' },
    } as Awaited<ReturnType<typeof findCampaignById>>)
    mockedLoadParticipation.mockResolvedValue({
      membershipId: 'mem_1',
      role: 'owner',
      controlledCharacterIds: [],
      participationState: 'staff',
      viewerState: { kind: 'ready' },
      activeCharacterIds: [],
    })

    await expect(
      loadCampaignOnboardingGate({ campaignId: 'camp_1', userId: 'user_1' }),
    ).resolves.toEqual({ kind: 'forbidden', reason: 'not_player' })
  })

  it('returns integrity_error for PC ready without active characters', async () => {
    mockedFindCampaign.mockResolvedValue({
      id: 'camp_1',
      identity: { name: 'Broken Campaign' },
    } as Awaited<ReturnType<typeof findCampaignById>>)
    mockedLoadParticipation.mockResolvedValue({
      membershipId: 'mem_1',
      role: 'pc',
      controlledCharacterIds: [],
      participationState: 'invalid',
      viewerState: { kind: 'ready' },
      activeCharacterIds: [],
    })

    await expect(
      loadCampaignOnboardingGate({ campaignId: 'camp_1', userId: 'user_1' }),
    ).resolves.toEqual({
      kind: 'integrity_error',
      reason: 'ready_pc_without_active_character',
    })
  })

  it('returns eligible reconnect with stale controlled character id', async () => {
    mockedFindCampaign.mockResolvedValue({
      id: 'camp_1',
      identity: { name: 'Reconnect Campaign' },
    } as Awaited<ReturnType<typeof findCampaignById>>)
    mockedLoadParticipation.mockResolvedValue({
      membershipId: 'mem_1',
      role: 'pc',
      controlledCharacterIds: ['char_stale'],
      participationState: 'invalid',
      viewerState: { kind: 'control_stale', characterId: 'char_stale' },
      activeCharacterIds: [],
    })

    await expect(
      loadCampaignOnboardingGate({ campaignId: 'camp_1', userId: 'user_1' }),
    ).resolves.toEqual({
      kind: 'eligible',
      campaignId: 'camp_1',
      membershipId: 'mem_1',
      mode: 'reconnect',
      characterId: 'char_stale',
    })
  })
})
