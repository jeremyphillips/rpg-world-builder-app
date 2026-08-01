import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

vi.mock('@/features/campaign/api/campaign-client')

import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { CAMPAIGNS_QUERY_ERROR_MESSAGE } from '@/features/campaign'
import { CAMPAIGNS_OVERVIEW_COPY } from '@/features/campaign/lib/campaigns-overview-copy'
import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'
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
    expect(await screen.findByText(CAMPAIGNS_OVERVIEW_COPY.empty.heading)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveAttribute('href', '/campaigns/new')
    expect(
      screen.getAllByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveLength(1)
  })

  it('shows only the error state when the campaigns query fails', async () => {
    listCampaigns.mockRejectedValue(new Error('network'))

    renderWithProviders(<CampaignsOverview />)

    expect(await screen.findByRole('alert')).toHaveTextContent(CAMPAIGNS_QUERY_ERROR_MESSAGE)
    expect(screen.queryByText(CAMPAIGNS_OVERVIEW_COPY.empty.heading)).not.toBeInTheDocument()
    expect(screen.queryByText('Your campaigns')).not.toBeInTheDocument()
  })

  it('moves actions into the header when campaigns exist', async () => {
    listCampaigns.mockResolvedValue([
      makeCampaignListItem({ id: 'camp_1', identity: { name: 'The Argent Road' } }),
    ])

    renderWithProviders(<CampaignsOverview />)

    expect(
      await screen.findByRole('heading', { level: 3, name: 'Your campaigns' }),
    ).toBeInTheDocument()
    expect(screen.getByText(CAMPAIGNS_OVERVIEW_COPY.hasCampaignsDescription)).toBeInTheDocument()
    expect(screen.queryByText(CAMPAIGNS_OVERVIEW_COPY.empty.heading)).not.toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveLength(1)
    expect(
      screen.getByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveClass('border-outline-button-border')
  })

  it('uses the primary new-campaign variant when no campaign rows exist', async () => {
    listCampaigns.mockResolvedValue([])

    renderWithProviders(<CampaignsOverview />)

    const link = await screen.findByRole('link', {
      name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel,
    })
    expect(link).not.toHaveClass('border-outline-button-border')
  })

  it('demotes new campaign when only incomplete campaign rows exist', async () => {
    listCampaigns.mockResolvedValue([
      makeCampaignListItem({
        id: 'camp_incomplete',
        identity: { name: 'Incomplete Campaign' },
        campaignRole: 'pc',
        controlledCharacterIds: [],
        viewerState: VIEWER_STATE.onboardingIncomplete,
      }),
    ])

    renderWithProviders(<CampaignsOverview />)

    expect(
      await screen.findByRole('link', { name: CAMPAIGNS_OVERVIEW_COPY.newCampaignLabel }),
    ).toHaveClass('border-outline-button-border')
  })
})
