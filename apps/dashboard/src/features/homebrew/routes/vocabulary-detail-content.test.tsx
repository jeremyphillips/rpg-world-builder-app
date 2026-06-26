import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ResolvedVocabularyOptionSet } from '@rpg/contracts'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { VocabularyDetailContent } from './vocabulary-detail-content'

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

function renderDetail(setId = 'creature-types', campaignId = 'camp_1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(['campaigns', campaignId, 'vocabulary', setId], mockSet)

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <VocabularyDetailContent campaignId={campaignId} setId={setId} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('VocabularyDetailContent', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(true)
  })

  it('renders the set table with source and usage columns', () => {
    renderDetail()

    expect(screen.getByRole('heading', { name: 'Creature Types' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Rules vocabulary sets' })).toBeInTheDocument()
    expect(screen.getByText('Aberration')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows a not-implemented state for disabled sets', () => {
    renderDetail('damage-types')

    expect(screen.getByRole('heading', { name: 'Damage Types' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Not available yet' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('opens the add sheet for managers', async () => {
    const user = userEvent.setup()
    renderDetail()

    await user.click(screen.getByRole('button', { name: 'New' }))
    expect(await screen.findByRole('dialog', { name: 'Add vocabulary entry' })).toBeInTheDocument()
  })

  it('hides manager actions for non-managers', () => {
    useCanManageCampaignMock.mockReturnValue(false)
    renderDetail()

    expect(screen.queryByRole('button', { name: 'New' })).not.toBeInTheDocument()
  })
})
