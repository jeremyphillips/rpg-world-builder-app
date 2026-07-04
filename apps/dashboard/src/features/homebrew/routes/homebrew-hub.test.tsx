import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { makeTestQueryClient, renderWithProviders } from '@/test/render'
import { VISIBLE_SIDEBAR_CONTENT } from '../lib/hub/content-registry'

import { HomebrewHubContent } from './homebrew-hub'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

function renderHub(campaignId = 'camp_1') {
  const queryClient = makeTestQueryClient()
  queryClient.setQueryData(['campaigns', campaignId, 'homebrew', 'summary'], {
    content: [
      { contentType: 'classes', totalCount: 2 },
      { contentType: 'spells', totalCount: 5 },
      { contentType: 'species', totalCount: 1 },
      { contentType: 'feats', totalCount: 0 },
      { contentType: 'equipment', totalCount: 10 },
      { contentType: 'skill-proficiencies', totalCount: 3 },
    ],
  })

  return renderWithProviders(<HomebrewHubContent campaignId={campaignId} />, { queryClient })
}

describe('HomebrewHubContent', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(false)
  })

  it('renders content and vocabulary sections with hub cards', () => {
    renderHub()

    expect(screen.getByRole('heading', { name: 'Homebrew' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Content' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rules Vocabulary' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rules Configuration' })).toBeInTheDocument()

    for (const entry of VISIBLE_SIDEBAR_CONTENT) {
      expect(screen.getByText(entry.label)).toBeInTheDocument()
    }

    expect(screen.getByText('Creature Types')).toBeInTheDocument()
    expect(screen.getByText('Character Configuration')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'View' }).length).toBeGreaterThan(0)
  })

  it('shows Create actions for managers on content types with create routes', () => {
    useCanManageCampaignMock.mockReturnValue(true)
    renderHub()

    expect(screen.getAllByRole('link', { name: 'Create' }).length).toBe(5)
  })

  it('hides Create actions for non-managers', () => {
    renderHub()
    expect(screen.queryByRole('link', { name: 'Create' })).not.toBeInTheDocument()
  })
})
