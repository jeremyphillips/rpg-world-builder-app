import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  defaultCampaignMechanicsPatch,
  resolveCharacterCreationPatch,
} from '@rpg/contracts'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('../api/ruleset-content-client', () => ({
  buildContextQueryKey: (rulesetId: string) => ['rulesets', rulesetId, 'character-builder-context'],
  fetchBuilderCatalog: vi.fn(),
  fetchCharacterCreationRules: vi.fn(),
}))

import { fetchBuilderCatalog, fetchCharacterCreationRules } from '../api/ruleset-content-client'
import { useBuildContext } from './use-build-context'

const mockFetchCatalog = vi.mocked(fetchBuilderCatalog)
const mockFetchRules = vi.mocked(fetchCharacterCreationRules)

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

describe('useBuildContext', () => {
  beforeEach(() => {
    mockFetchCatalog.mockReset()
    mockFetchRules.mockReset()
    mockFetchCatalog.mockResolvedValue(emptyCatalog)
    mockFetchRules.mockResolvedValue(rulesPatch)
  })

  it('does not fetch when rulesetId is undefined', () => {
    const { result } = renderHook(() => useBuildContext(undefined), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(mockFetchCatalog).not.toHaveBeenCalled()
    expect(mockFetchRules).not.toHaveBeenCalled()
  })

  it('assembles a standalone CharacterBuildContext and catalog index', async () => {
    const { result } = renderHook(() => useBuildContext('srd-cc-5.2.1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.context).not.toBeNull())

    expect(result.current.context).toMatchObject({
      channel: 'build',
      surface: 'dashboard',
      characterKind: 'pc',
      mode: 'dashboard',
      scope: { type: 'standalone', rulesetId: 'srd-cc-5.2.1' },
      rulesScope: { type: 'ruleset', rulesetId: 'srd-cc-5.2.1' },
      ownershipTarget: { type: 'user' },
      rulesetId: 'srd-cc-5.2.1',
      catalog: emptyCatalog,
      permissions: { canCreateCharacter: true },
    })
    expect(result.current.context?.characterCreationRules.abilityGeneration).toEqual(
      DEFAULT_ABILITY_GENERATION_RULES,
    )
    expect(result.current.catalogIndex?.species.size).toBe(0)
    expect(result.current.storageKey).toBe('character-builder:dashboard:standalone:srd-cc-5.2.1')
  })
})
