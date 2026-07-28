import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  defaultCampaignMechanicsPatch,
  resolveCharacterCreationPatch,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('@/features/campaign', () => ({
  useCampaigns: vi.fn(),
}))

vi.mock('@/features/homebrew', () => ({
  useRulesetPatch: vi.fn(),
}))

vi.mock('../api/campaign-content-client', () => ({
  campaignBuildContextQueryKey: (campaignId: string) =>
    ['campaigns', campaignId, 'character-builder-context'] as const,
  fetchCampaignBuilderCatalog: vi.fn(),
}))

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'
import { fetchCampaignBuilderCatalog } from '../api/campaign-content-client'
import { useCampaignBuildContext } from './use-campaign-build-context'

const mockUseCampaigns = vi.mocked(useCampaigns)
const mockUseRulesetPatch = vi.mocked(useRulesetPatch)
const mockFetchCatalog = vi.mocked(fetchCampaignBuilderCatalog)

const emptyCatalog = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
  languages: [],
}

const rulesPatch = {
  characterCreation: resolveCharacterCreationPatch(
    undefined,
    getStandardStartingWealthRules('srd-cc-5.2.1'),
  ),
  mechanics: defaultCampaignMechanicsPatch(),
}

describe('useCampaignBuildContext', () => {
  beforeEach(() => {
    mockUseCampaigns.mockReset()
    mockUseRulesetPatch.mockReset()
    mockFetchCatalog.mockReset()
    mockUseCampaigns.mockReturnValue({
      data: [{ id: 'camp-1', rulesetId: 'srd-cc-5.2.1' }],
    } as ReturnType<typeof useCampaigns>)
    mockUseRulesetPatch.mockReturnValue({
      data: rulesPatch,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
    } as ReturnType<typeof useRulesetPatch>)
    mockFetchCatalog.mockResolvedValue(emptyCatalog)
  })

  it('does not fetch catalog when campaignId is undefined', () => {
    const { result } = renderHook(() => useCampaignBuildContext(undefined), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(mockFetchCatalog).not.toHaveBeenCalled()
  })

  it('assembles a campaign NPC CharacterBuildContext and catalog index', async () => {
    const { result } = renderHook(() => useCampaignBuildContext('camp-1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.context).not.toBeNull())

    expect(result.current.context).toMatchObject({
      channel: 'build',
      surface: 'dashboard',
      characterKind: 'npc',
      mode: 'dashboard',
      scope: { type: 'campaign', campaignId: 'camp-1', rulesetId: 'srd-cc-5.2.1' },
      rulesScope: {
        type: 'campaign',
        campaignId: 'camp-1',
        rulesetId: 'srd-cc-5.2.1',
      },
      ownershipTarget: { type: 'campaign', campaignId: 'camp-1' },
      acquisition: { kind: 'campaign_npc', campaignId: 'camp-1' },
      rulesetId: 'srd-cc-5.2.1',
      catalog: emptyCatalog,
      permissions: { canCreateCharacter: true },
    })
    expect(result.current.context?.characterCreationRules.abilityGeneration).toEqual(
      DEFAULT_ABILITY_GENERATION_RULES,
    )
    expect(result.current.catalogIndex?.species.size).toBe(0)
    expect(result.current.storageKey).toBe('character-builder:campaign:camp-1:npc')
    expect(result.current.draftScope).toEqual({
      kind: 'campaign',
      campaignId: 'camp-1',
      characterKind: 'npc',
    })
  })
})
