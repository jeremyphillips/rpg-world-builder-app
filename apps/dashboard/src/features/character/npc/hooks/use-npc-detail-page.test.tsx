import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  defaultCampaignMechanicsPatch,
  indexCharacterBuildCatalog,
  resolveCharacterCreationPatch,
  type SystemRulesetId,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import type * as CampaignFeature from '@/features/campaign'
import type * as HomebrewFeature from '@/features/homebrew'

import { buildCharacterDetailViewModel, toCharacterDetailSource } from '@/features/character'
import type * as CampaignContentClient from '../../api/campaign-content-client'
import { resolveCampaignXpProgressionForRules } from '@/lib/campaign-xp-progression.lib'
import { makeQueryWrapper } from '@/test/make-wrapper'
import { makeCampaignNpcDetail } from '@/test/fixtures/factories/additional/character'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = await importOriginal<typeof CampaignFeature>()
  return {
    ...actual,
    useCampaigns: vi.fn(),
    useCanManageCampaign: vi.fn(() => true),
  }
})

vi.mock('@/features/homebrew', async (importOriginal) => {
  const actual = await importOriginal<typeof HomebrewFeature>()
  return { ...actual, useRulesetPatch: vi.fn() }
})

vi.mock('../../api/campaign-content-client', async (importOriginal) => {
  const actual = await importOriginal<typeof CampaignContentClient>()
  return { ...actual, fetchCampaignBuilderCatalog: vi.fn() }
})

vi.mock('./use-npcs', () => ({
  useNpc: vi.fn(),
}))

vi.mock('../../hooks/use-character-organization-references', () => ({
  useCharacterOrganizationReferences: vi.fn(),
}))

vi.mock('../../hooks/use-character-location-references', () => ({
  useCharacterLocationReferences: vi.fn(),
}))

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'
import { fetchCampaignBuilderCatalog } from '../../api/campaign-content-client'
import { useCharacterOrganizationReferences } from '../../hooks/use-character-organization-references'
import { useCharacterLocationReferences } from '../../hooks/use-character-location-references'

import { useNpc } from './use-npcs'
import { useNpcDetailPage } from './use-npc-detail-page'

const mockUseCampaigns = vi.mocked(useCampaigns)
const mockUseRulesetPatch = vi.mocked(useRulesetPatch)
const mockFetchCatalog = vi.mocked(fetchCampaignBuilderCatalog)
const mockUseNpc = vi.mocked(useNpc)
const mockOrganizations = vi.mocked(useCharacterOrganizationReferences)
const mockLocations = vi.mocked(useCharacterLocationReferences)

const RULESET_ID = 'srd-cc-5.2.1' satisfies SystemRulesetId

const emptyCatalog = {
  species: [],
  classes: [],
  spells: [],
  equipment: [],
  skillProficiencies: [],
  organizations: [],
  languages: [],
}

const rulesPatch = {
  characterCreation: resolveCharacterCreationPatch(
    undefined,
    getStandardStartingWealthRules(RULESET_ID),
  ),
  mechanics: defaultCampaignMechanicsPatch(),
}

function settledQuery<T>(data: T) {
  return {
    data,
    isPending: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }
}

function wrapper({ children }: { children: ReactNode }) {
  const QueryWrapper = makeQueryWrapper()
  return (
    <QueryWrapper>
      <MemoryRouter initialEntries={['/campaigns/camp-1/npcs/npc-1']}>
        <Routes>
          <Route path="/campaigns/:campaignId/npcs/:npcId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryWrapper>
  )
}

describe('useNpcDetailPage', () => {
  const npcDetail = makeCampaignNpcDetail()

  beforeEach(() => {
    mockUseCampaigns.mockReset()
    mockUseRulesetPatch.mockReset()
    mockFetchCatalog.mockReset()
    mockUseNpc.mockReset()
    mockOrganizations.mockReset()
    mockLocations.mockReset()

    mockUseCampaigns.mockReturnValue({
      data: [{ id: 'camp-1', rulesetId: RULESET_ID }],
      isPending: false,
    } as unknown as ReturnType<typeof useCampaigns>)
    mockUseRulesetPatch.mockReturnValue({
      data: rulesPatch,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)
    mockFetchCatalog.mockResolvedValue(emptyCatalog)
    mockUseNpc.mockReturnValue(settledQuery(npcDetail) as unknown as ReturnType<typeof useNpc>)
    mockOrganizations.mockReturnValue(
      settledQuery([]) as unknown as ReturnType<typeof useCharacterOrganizationReferences>,
    )
    mockLocations.mockReturnValue(
      settledQuery([]) as unknown as ReturnType<typeof useCharacterLocationReferences>,
    )
  })

  it('matches a default-rules view model from the reference catalog', async () => {
    const { result } = renderHook(() => useNpcDetailPage(), { wrapper })

    await waitFor(() => expect(result.current.viewModel).not.toBeNull())

    expect(mockFetchCatalog).toHaveBeenCalledWith('camp-1', RULESET_ID, { scope: 'reference' })
    const rules = {
      ...rulesPatch.characterCreation,
      abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
      armorClass: rulesPatch.mechanics.armorClass,
    }
    expect(result.current.viewModel).toEqual(
      buildCharacterDetailViewModel({
        source: toCharacterDetailSource(npcDetail.character),
        catalogIndex: indexCharacterBuildCatalog(emptyCatalog),
        rules,
        xpProgression: resolveCampaignXpProgressionForRules(RULESET_ID, rules.progression),
        organizationReferences: [],
        locationReferences: [],
      }),
    )
  })

  it('uses base 9 for unarmored AC', async () => {
    mockUseRulesetPatch.mockReturnValue({
      data: {
        ...rulesPatch,
        mechanics: {
          ...rulesPatch.mechanics,
          armorClass: { mode: 'ascending', base: 9 },
        },
      },
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)

    const { result } = renderHook(() => useNpcDetailPage(), { wrapper })

    await waitFor(() =>
      expect(result.current.viewModel?.stats.find((stat) => stat.id === 'ac')?.value).toBe('11'),
    )
  })

  it('reports loading, error, and missing ruleset without a view model', () => {
    mockUseRulesetPatch.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isFetching: true,
      error: null,
      fetchStatus: 'fetching',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)

    const loading = renderHook(() => useNpcDetailPage(), { wrapper })
    expect(loading.result.current.isPending).toBe(true)
    expect(loading.result.current.viewModel).toBeNull()
    expect(loading.result.current.unavailable).toEqual({ kind: 'loading' })
    loading.unmount()

    mockUseRulesetPatch.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      isFetching: false,
      error: new Error('ruleset failed'),
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)
    const failed = renderHook(() => useNpcDetailPage(), { wrapper })
    expect(failed.result.current.isError).toBe(true)
    expect(failed.result.current.errorLabel).toBe('ruleset failed')
    expect(failed.result.current.viewModel).toBeNull()
    failed.unmount()

    mockUseCampaigns.mockReturnValue({
      data: [],
      isPending: false,
    } as unknown as ReturnType<typeof useCampaigns>)
    mockUseRulesetPatch.mockReturnValue({
      data: rulesPatch,
      isPending: false,
      isError: false,
      isFetching: false,
      error: null,
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)
    const missing = renderHook(() => useNpcDetailPage(), { wrapper })
    expect(missing.result.current.unavailable).toEqual({ kind: 'missing_ruleset' })
    expect(missing.result.current.viewModel).toBeNull()
  })
})
