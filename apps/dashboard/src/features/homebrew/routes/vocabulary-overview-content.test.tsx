import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ResolvedVocabularyOptionSet } from '@rpg/contracts'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { ROUTES } from '@/app/routes'
import { makeTestQueryClient, renderWithProviders } from '@/test/render'
import { VocabularyOverviewContent } from './vocabulary-overview-content'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

const mockSet: ResolvedVocabularyOptionSet = {
  id: 'creature-types',
  options: [
    {
      id: 'aberration',
      label: 'Aberration',
      description: 'Alien entities.',
      source: 'system',
      status: 'active',
      usedBy: 0,
    },
    {
      id: 'fey-kin',
      label: 'Fey Kin',
      source: 'campaign',
      status: 'active',
      usedBy: 2,
    },
  ],
}

function renderOverview(setId = 'creature-types', campaignId = 'camp_1') {
  const queryClient = makeTestQueryClient()
  queryClient.setQueryData(['campaigns', campaignId, 'vocabulary', setId], mockSet)

  return renderWithProviders(<VocabularyOverviewContent campaignId={campaignId} setId={setId} />, {
    queryClient,
  })
}

describe('VocabularyOverviewContent', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(true)
  })

  it('renders the set table with source and usage columns', () => {
    renderOverview()

    expect(screen.getByRole('heading', { name: 'Creature Types' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Aberration' })).toHaveAttribute(
      'href',
      ROUTES.gameTerms.detail('camp_1', 'creature-types', 'aberration'),
    )
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows browse-only overview for sets without management capabilities', () => {
    const queryClient = makeTestQueryClient()
    queryClient.setQueryData(['campaigns', 'camp_1', 'vocabulary', 'damage-types'], {
      id: 'damage-types',
      options: [],
    })

    renderWithProviders(<VocabularyOverviewContent campaignId="camp_1" setId="damage-types" />, {
      queryClient,
    })

    expect(screen.getByRole('heading', { name: 'Damage Types' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New damage type' })).not.toBeInTheDocument()
  })

  it('shows a not-found state for internal-only set ids', () => {
    renderOverview('edition-presets')

    expect(screen.getByRole('heading', { name: 'Not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Game Terms' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows a not-found fallback for invalid set ids', () => {
    renderOverview('not-a-set')

    expect(screen.getByRole('link', { name: 'Back to Game Terms' })).toBeInTheDocument()
  })

  it('opens the add sheet for managers on managed sets', async () => {
    const user = userEvent.setup()
    renderOverview()

    await user.click(screen.getByRole('button', { name: 'New creature type' }))
    expect(await screen.findByRole('dialog', { name: 'New creature type' })).toBeInTheDocument()
  })

  it('hides manager actions for non-managers', () => {
    useCanManageCampaignMock.mockReturnValue(false)
    renderOverview()

    expect(screen.queryByRole('button', { name: 'New creature type' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })
})
