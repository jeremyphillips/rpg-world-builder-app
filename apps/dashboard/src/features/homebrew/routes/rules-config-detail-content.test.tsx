import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  CREATURE_TYPE_SET_ID,
  defaultCampaignMechanicsPatch,
  type RulesetPatchRead,
} from '@rpg/contracts'

import { renderWithDataRouter } from '@/lib/test-router'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCanManageCampaign: vi.fn(),
  }
})

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { RulesConfigDetailContent } from './rules-config-detail-content'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

const mockPatch: RulesetPatchRead = {
  characterCreation: {
    startingLevel: 3,
    importedCharacters: { policy: 'approval_required' },
    progression: { maxCharacterLevel: 20 },
    species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
  },
  mechanics: defaultCampaignMechanicsPatch(),
}

function renderDetail(configId = 'character-configuration', campaignId = 'camp_1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(['campaigns', campaignId, 'ruleset-patch'], mockPatch)
  queryClient.setQueryData(['campaigns', campaignId, 'vocabulary', CREATURE_TYPE_SET_ID], {
    id: CREATURE_TYPE_SET_ID,
    options: [
      {
        id: 'humanoid',
        label: 'Humanoid',
        source: 'system',
        status: 'active',
        usedBy: 0,
      },
    ],
  })

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

describe('RulesConfigDetailContent', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(true)
  })

  it('renders the character configuration form with section navigation', async () => {
    renderDetail()

    expect(
      await screen.findByRole('heading', { name: 'Character Configuration' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Character configuration sections' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Character starting level')).toHaveValue(3)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  it('shows an unknown state for invalid config ids', () => {
    renderDetail('missing')

    expect(screen.getByText('This rules configuration page is not available.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Homebrew' })).toBeInTheDocument()
  })

  it('hides save actions for non-managers', async () => {
    useCanManageCampaignMock.mockReturnValue(false)
    renderDetail()

    await screen.findByLabelText('Character starting level')
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
    expect(
      screen.getByText('You can view these rules but only campaign owners can edit them.'),
    ).toBeInTheDocument()
  })
})
