import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

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

import {
  buildCharacterDetailViewModel,
  fetchCampaignBuilderCatalog,
  toCharacterDetailSource,
  useCharacterLocationReferences,
  useCharacterOrganizationReferences,
} from '@/features/character'
import { resolveCampaignXpProgressionForRules } from '@/lib/campaign-xp-progression.lib'
import { makeQueryWrapper } from '@/test/make-wrapper'
import { makeEquipment } from '@/test/fixtures/factories/equipment'
import { makePcCharacter } from '@/test/fixtures/factories/additional/character'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = await importOriginal<typeof CampaignFeature>()
  return { ...actual, useCampaigns: vi.fn() }
})

vi.mock('@/features/homebrew', async (importOriginal) => {
  const actual = await importOriginal<typeof HomebrewFeature>()
  return { ...actual, useRulesetPatch: vi.fn() }
})

vi.mock('@/features/character/api/campaign-content-client', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as Record<string, unknown>),
    fetchCampaignBuilderCatalog: vi.fn(),
  }
})

vi.mock('./use-campaign-character', () => ({
  useCampaignCharacter: vi.fn(),
}))

vi.mock('@/features/character/hooks/use-character-organization-references', () => ({
  useCharacterOrganizationReferences: vi.fn(),
}))

vi.mock('@/features/character/hooks/use-character-location-references', () => ({
  useCharacterLocationReferences: vi.fn(),
}))

import { useCampaigns } from '@/features/campaign'
import { useRulesetPatch } from '@/features/homebrew'

import { useCampaignCharacter } from './use-campaign-character'
import { useCampaignCharacterDetail } from './use-campaign-character-detail'

const mockUseCampaigns = vi.mocked(useCampaigns)
const mockUseRulesetPatch = vi.mocked(useRulesetPatch)
const mockFetchCatalog = vi.mocked(fetchCampaignBuilderCatalog)
const mockUseCampaignCharacter = vi.mocked(useCampaignCharacter)
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
  feats: [],
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

function viewModelFor(
  character: ReturnType<typeof makePcCharacter>,
  catalog: typeof emptyCatalog,
  armorClass: { mode: 'ascending'; base: 9 | 10 },
) {
  const rules = {
    ...rulesPatch.characterCreation,
    abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
    armorClass,
  }
  return buildCharacterDetailViewModel({
    source: toCharacterDetailSource(character),
    catalogIndex: indexCharacterBuildCatalog(catalog),
    rules,
    xpProgression: resolveCampaignXpProgressionForRules(RULESET_ID, rules.progression),
    organizationReferences: [],
    locationReferences: [],
  })
}

describe('useCampaignCharacterDetail', () => {
  const character = makePcCharacter()

  beforeEach(() => {
    mockUseCampaigns.mockReset()
    mockUseRulesetPatch.mockReset()
    mockFetchCatalog.mockReset()
    mockUseCampaignCharacter.mockReset()
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
    mockUseCampaignCharacter.mockReturnValue(
      settledQuery({ character }) as unknown as ReturnType<typeof useCampaignCharacter>,
    )
    mockOrganizations.mockReturnValue(
      settledQuery([]) as unknown as ReturnType<typeof useCharacterOrganizationReferences>,
    )
    mockLocations.mockReturnValue(
      settledQuery([]) as unknown as ReturnType<typeof useCharacterLocationReferences>,
    )
  })

  it('matches the standalone view model for a default campaign', async () => {
    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', character.id), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.viewModel).not.toBeNull())

    expect(mockFetchCatalog).toHaveBeenCalledWith('camp-1', RULESET_ID, { scope: 'reference' })
    expect(result.current.viewModel).toEqual(
      viewModelFor(character, emptyCatalog, { mode: 'ascending', base: 10 }),
    )
    expect(result.current.viewModel?.stats.find((stat) => stat.id === 'ac')?.value).toBe('12')
  })

  it('uses a base 9 campaign for unarmored AC without mutating persisted character state', async () => {
    const persisted = {
      xp: character.xp,
      classes: character.classes,
      equipment: character.equipment,
      wealth: character.wealth,
    }
    const { result, rerender } = renderHook(
      () => useCampaignCharacterDetail('camp-1', character.id),
      {
        wrapper: makeQueryWrapper(),
      },
    )

    await waitFor(() => expect(result.current.viewModel).not.toBeNull())

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
    rerender()

    await waitFor(() =>
      expect(result.current.viewModel?.stats.find((stat) => stat.id === 'ac')?.value).toBe('11'),
    )
    expect(result.current.campaignCharacter?.character).toBe(character)
    expect(character.xp).toBe(persisted.xp)
    expect(character.classes).toBe(persisted.classes)
    expect(character.equipment).toBe(persisted.equipment)
    expect(character.wealth).toBe(persisted.wealth)
  })

  it('resolves a persisted item that is present in the reference catalog', async () => {
    const blade = makeEquipment({
      id: 'homebrew-blade',
      name: 'Hidden Blade',
      slug: 'hidden-blade',
    })
    const equipped = makePcCharacter({
      equipment: {
        weapons: [
          { entryId: 'w1', equipmentId: blade.id, quantity: 1, equipped: true, sources: [] },
        ],
        armor: [],
        tools: [],
        gear: [],
        magicItems: [],
        vehicles: [],
        mounts: [],
      },
    })
    const catalog = { ...emptyCatalog, equipment: [blade] }
    mockUseCampaignCharacter.mockReturnValue(
      settledQuery({ character: equipped }) as unknown as ReturnType<typeof useCampaignCharacter>,
    )
    mockFetchCatalog.mockResolvedValue(catalog)

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', equipped.id), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.viewModel).not.toBeNull())

    expect(result.current.viewModel?.equipment).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'resolved', displayName: 'Hidden Blade' }),
      ]),
    )
  })

  it('keeps an unresolved equipment reference explicit', async () => {
    const equipped = makePcCharacter({
      equipment: {
        weapons: [
          { entryId: 'missing', equipmentId: 'gone', quantity: 1, equipped: true, sources: [] },
        ],
        armor: [],
        tools: [],
        gear: [],
        magicItems: [],
        vehicles: [],
        mounts: [],
      },
    })
    mockUseCampaignCharacter.mockReturnValue(
      settledQuery({ character: equipped }) as unknown as ReturnType<typeof useCampaignCharacter>,
    )

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', equipped.id), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.viewModel).not.toBeNull())

    expect(result.current.viewModel?.equipment).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'missing', referenceId: 'gone' })]),
    )
  })

  it('shows a missing armor reference instead of unarmored AC', async () => {
    const equipped = makePcCharacter({
      equipment: {
        weapons: [],
        armor: [
          {
            entryId: 'a1',
            equipmentId: 'gone-armor',
            quantity: 1,
            equipped: true,
            sources: [],
          },
        ],
        tools: [],
        gear: [],
        magicItems: [],
        vehicles: [],
        mounts: [],
      },
    })
    mockUseCampaignCharacter.mockReturnValue(
      settledQuery({ character: equipped }) as unknown as ReturnType<typeof useCampaignCharacter>,
    )

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', equipped.id), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.viewModel).not.toBeNull())

    expect(result.current.viewModel?.stats.find((stat) => stat.id === 'ac')?.value).toBe(
      'Missing armor reference',
    )
  })

  it('stays pending while the ruleset patch is loading', () => {
    mockUseRulesetPatch.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      isFetching: true,
      error: null,
      fetchStatus: 'fetching',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', character.id), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.viewModel).toBeNull()
    expect(result.current.unavailable).toEqual({ kind: 'loading' })
  })

  it('surfaces a ruleset query error without a view model', () => {
    mockUseRulesetPatch.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      isFetching: false,
      error: new Error('ruleset failed'),
      fetchStatus: 'idle',
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useRulesetPatch>)

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', character.id), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current.isError).toBe(true)
    expect(result.current.errorLabel).toBe('ruleset failed')
    expect(result.current.viewModel).toBeNull()
  })

  it('reports a missing campaign ruleset', () => {
    mockUseCampaigns.mockReturnValue({
      data: [],
      isPending: false,
    } as unknown as ReturnType<typeof useCampaigns>)

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', character.id), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current.unavailable).toEqual({ kind: 'missing_ruleset' })
    expect(result.current.viewModel).toBeNull()
  })

  it('reports a ruleset mismatch instead of deriving on the campaign ruleset', async () => {
    const drifted = makePcCharacter({ rulesetId: 'srd-cc-5.1' as SystemRulesetId })
    mockUseCampaignCharacter.mockReturnValue(
      settledQuery({ character: drifted }) as unknown as ReturnType<typeof useCampaignCharacter>,
    )

    const { result } = renderHook(() => useCampaignCharacterDetail('camp-1', drifted.id), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.unavailable).toEqual({ kind: 'ruleset_mismatch' }))
    expect(result.current.viewModel).toBeNull()
  })
})
