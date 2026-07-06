import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'
import {
  CREATURE_TYPE_SET_ID,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  defaultCampaignMechanicsPatch,
  resolveCharacterCreationPatch,
  type RulesetPatchRead,
} from '@rpg/contracts'

import { renderWithDataRouter } from '@/lib/test-router'
import { makeTestQueryClient } from '@/test/render'

import { buildAttackResolutionModeVocabulary } from '../lib/vocabulary/sets/attack-resolution-modes'
import { buildCreatureTypeVocabulary } from '../lib/vocabulary/sets/creature-types'
import { buildEditionPresetVocabulary } from '../lib/vocabulary/sets/edition-presets'
import { useAttackResolutionModeVocabulary } from '../hooks/use-attack-resolution-mode-vocabulary'
import { useCreatureTypeVocabulary } from '../hooks/use-creature-type-vocabulary'
import { useEditionPresetVocabulary } from '../hooks/use-edition-preset-vocabulary'
import { useRulesetPatch } from '../hooks/use-ruleset-patch'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCanManageCampaign: vi.fn(),
    buildRulesConfigFields: vi.fn(() => [
      {
        type: 'number',
        name: 'startingLevel',
        label: 'Character starting level',
        min: 1,
        max: 20,
        defaultValue: 1,
        required: true,
      },
    ]),
  }
})

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

vi.mock('../hooks/use-ruleset-patch', () => ({
  rulesetPatchQueryKey: (campaignId: string) => ['campaigns', campaignId, 'ruleset-patch'] as const,
  useRulesetPatch: vi.fn(),
}))

vi.mock('../hooks/use-creature-type-vocabulary', () => ({
  useCreatureTypeVocabulary: vi.fn(),
}))

vi.mock('../hooks/use-edition-preset-vocabulary', () => ({
  useEditionPresetVocabulary: vi.fn(),
}))

vi.mock('../hooks/use-attack-resolution-mode-vocabulary', () => ({
  useAttackResolutionModeVocabulary: vi.fn(),
}))

vi.mock('../hooks/use-patch-character-creation-mutation', () => ({
  usePatchCharacterCreationMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
  })),
}))

vi.mock('../hooks/use-patch-mechanics-mutation', () => ({
  usePatchMechanicsMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
  })),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { RulesConfigDetailContent } from './rules-config-detail-content'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)
const useRulesetPatchMock = vi.mocked(useRulesetPatch)
const useCreatureTypeVocabularyMock = vi.mocked(useCreatureTypeVocabulary)
const useEditionPresetVocabularyMock = vi.mocked(useEditionPresetVocabulary)
const useAttackResolutionModeVocabularyMock = vi.mocked(useAttackResolutionModeVocabulary)

const mockPatch: RulesetPatchRead = {
  characterCreation: resolveCharacterCreationPatch(
    {
      startingLevel: 3,
      importedCharacters: { policy: 'approval_required' },
      progression: { maxCharacterLevel: 20 },
      species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
      multiclassing: defaultMulticlassingRules(),
      subclasses: defaultSubclassingRules(),
    },
    getStandardStartingWealthRules('srd-cc-5.2.1'),
  ),
  mechanics: defaultCampaignMechanicsPatch(),
}

const creatureTypeSet = {
  id: CREATURE_TYPE_SET_ID,
  options: [
    {
      id: 'humanoid',
      label: 'Humanoid',
      source: 'system' as const,
      status: 'active' as const,
      usedBy: 0,
    },
  ],
}

const editionPresetOptions = [
  { id: '5e', label: 'Modern 5e', source: 'system', status: 'active', usedBy: 0 },
  { id: '3e', label: 'Modern 3e', source: 'system', status: 'active', usedBy: 0 },
] as const

const attackResolutionOptions = [
  {
    id: 'proficiency_attack_vs_ac',
    label: 'Proficiency attack vs. AC',
    source: 'system',
    status: 'active',
    usedBy: 0,
  },
  {
    id: 'attack_bonus_vs_target_ac',
    label: 'Attack bonus vs. target AC',
    source: 'system',
    status: 'active',
    usedBy: 0,
  },
] as const

function mockResolvedRulesData() {
  useRulesetPatchMock.mockReturnValue({
    data: mockPatch,
    isPending: false,
    isError: false,
  } as ReturnType<typeof useRulesetPatch>)

  useCreatureTypeVocabularyMock.mockReturnValue({
    vocabulary: buildCreatureTypeVocabulary(creatureTypeSet),
    isPending: false,
    isError: false,
  } as ReturnType<typeof useCreatureTypeVocabulary>)

  useEditionPresetVocabularyMock.mockReturnValue({
    vocabulary: buildEditionPresetVocabulary({ options: [...editionPresetOptions] }),
    isPending: false,
    isError: false,
  } as ReturnType<typeof useEditionPresetVocabulary>)

  useAttackResolutionModeVocabularyMock.mockReturnValue({
    vocabulary: buildAttackResolutionModeVocabulary({ options: [...attackResolutionOptions] }),
    isPending: false,
    isError: false,
  } as ReturnType<typeof useAttackResolutionModeVocabulary>)
}

function renderDetail(configId = 'character-configuration', campaignId = 'camp_1') {
  const queryClient = makeTestQueryClient()

  return renderWithDataRouter(
    [
      {
        path: '/campaigns/:campaignId/homebrew/rules-config/:configId',
        element: (
          <QueryClientProvider client={queryClient}>
            <RulesConfigDetailContent campaignId={campaignId} configId={configId} />
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: [`/campaigns/${campaignId}/homebrew/rules-config/${configId}`] },
  )
}

async function expectCharacterConfigurationReady() {
  expect(
    await screen.findByRole('heading', { name: 'Character Configuration' }),
  ).toBeInTheDocument()
  await screen.findByLabelText('Character starting level')
}

async function expectMechanicsReady() {
  expect(await screen.findByRole('heading', { name: 'Mechanics' })).toBeInTheDocument()
  await screen.findByRole('radio', { name: /Modern 5e/i })
}

describe('RulesConfigDetailContent', { timeout: 15_000 }, () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(true)
    mockResolvedRulesData()
  })

  it('renders the character configuration form with section navigation', async () => {
    renderDetail()
    await expectCharacterConfigurationReady()

    expect(
      screen.getByRole('navigation', { name: 'Character configuration sections' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Character starting level')).toHaveValue(3)
    expect(screen.getByRole('link', { name: 'Subclasses' })).toHaveAttribute('href', '#subclasses')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('renders the mechanics configuration form with section navigation', async () => {
    renderDetail('mechanics')
    await expectMechanicsReady()

    expect(
      screen.getByRole('navigation', { name: 'Mechanics configuration sections' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Modern 5e/i })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('shows an unknown state for invalid config ids', () => {
    renderDetail('missing')

    expect(screen.getByText(/not available/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Homebrew' })).toBeInTheDocument()
  })

  it('hides save actions for non-managers', async () => {
    useCanManageCampaignMock.mockReturnValue(false)
    renderDetail()
    await expectCharacterConfigurationReady()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
    })
    expect(screen.getByText(/only campaign owners can edit/i)).toBeInTheDocument()
  })
})
