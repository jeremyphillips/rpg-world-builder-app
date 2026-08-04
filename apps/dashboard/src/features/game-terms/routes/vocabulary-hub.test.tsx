import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import type { ResolvedVocabularyOptionSet } from '@rpg/contracts'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useCanManageCampaign: vi.fn(),
  }
})

import { useCanManageCampaign } from '@/features/campaign'

import { makeTestQueryClient, renderWithProviders } from '@/test/render'
import { VocabularyHubContent } from './vocabulary-hub'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

const mockSets: ResolvedVocabularyOptionSet[] = [
  {
    id: 'creature-types',
    options: [
      {
        id: 'aberration',
        label: 'Aberration',
        source: 'system',
        status: 'active',
        usedBy: 0,
      },
      {
        id: 'retired',
        label: 'Retired',
        source: 'campaign',
        status: 'disabled',
        usedBy: 0,
      },
    ],
  },
  {
    id: 'damage-types',
    options: [
      {
        id: 'fire',
        label: 'Fire',
        source: 'system',
        status: 'active',
        usedBy: 0,
      },
    ],
  },
]

function renderHub(campaignId = 'camp_1') {
  const queryClient = makeTestQueryClient()
  queryClient.setQueryData(['campaigns', campaignId, 'vocabulary'], mockSets)

  return renderWithProviders(<VocabularyHubContent campaignId={campaignId} />, { queryClient })
}

describe('VocabularyHubContent', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(false)
  })

  it('renders browsable categories with SSOT descriptions and term counts', () => {
    renderHub()

    expect(screen.getByRole('heading', { name: 'Game Terms' })).toBeInTheDocument()
    expect(
      screen.getByText('Taxonomic classification shared by species and monsters.'),
    ).toBeInTheDocument()
    expect(screen.getByText('2 terms')).toBeInTheDocument()
    expect(screen.getByText('1 term')).toBeInTheDocument()
  })

  it('shows unavailable counts only for managers', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderHub()

    expect(screen.getByText('2 terms · 1 unavailable')).toBeInTheDocument()
  })
})
