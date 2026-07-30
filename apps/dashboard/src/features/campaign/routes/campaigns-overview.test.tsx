import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

vi.mock('@/features/campaign/api/campaign-client')

import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { CAMPAIGNS_OVERVIEW_COPY } from '@/features/campaign/lib/campaigns-overview-copy'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { renderWithProviders } from '@/test/render'
import { CampaignsOverview } from './campaigns-overview'

const listCampaigns = vi.mocked(listCampaignsFn)

describe('CampaignsOverview', () => {
  beforeEach(() => {
    listCampaigns.mockReset()
  })

  it('renders empty-state copy and actions below the intro', async () => {
    listCampaigns.mockResolvedValue([])

    renderWithProviders(<CampaignsOverview />)

    expect(await screen.findByRole('heading', { name: 'Campaigns' })).toBeInTheDocument()
    expect(screen.getByText(CAMPAIGNS_OVERVIEW_COPY.description)).toBeInTheDocument()
    expect(screen.getByText(CAMPAIGNS_OVERVIEW_COPY.empty.heading)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveAttribute('href', '/campaigns/new')
    expect(
      screen.getAllByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveLength(1)
  })

  it('moves actions into the header when campaigns exist', async () => {
    listCampaigns.mockResolvedValue([
      makeCampaignListItem({ id: 'camp_1', identity: { name: 'The Argent Road' } }),
    ])

    renderWithProviders(<CampaignsOverview />)

    expect(await screen.findByText('Your campaigns')).toBeInTheDocument()
    expect(screen.getByText(CAMPAIGNS_OVERVIEW_COPY.hasCampaignsDescription)).toBeInTheDocument()
    expect(screen.queryByText(CAMPAIGNS_OVERVIEW_COPY.empty.heading)).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveLength(1)
  })
})
