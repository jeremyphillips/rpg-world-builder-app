/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

const { useCampaigns } = vi.hoisted(() => ({
  useCampaigns: vi.fn(),
}))

vi.mock('../hooks/use-campaigns', () => ({
  useCampaigns,
}))

import { CampaignLayout } from './campaign-layout'

const incompleteCampaign = makeCampaignListItem({
  id: 'camp_1',
  identity: { name: 'Stormwatch' },
  viewerState: VIEWER_STATE.onboardingIncomplete,
})

describe('CampaignLayout', () => {
  it('shows the onboarding alert on campaign overview routes', () => {
    useCampaigns.mockReturnValue({ data: [incompleteCampaign], isPending: false, isError: false })

    render(
      <MemoryRouter initialEntries={['/campaigns/camp_1']}>
        <Routes>
          <Route path="/campaigns/:campaignId/*" element={<CampaignLayout />}>
            <Route index element={<div>Campaign overview</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Finish joining Stormwatch')).toBeInTheDocument()
    expect(screen.getByText('Campaign overview')).toBeInTheDocument()
  })

  it('hides the onboarding alert on the onboarding route', () => {
    useCampaigns.mockReturnValue({ data: [incompleteCampaign], isPending: false, isError: false })

    render(
      <MemoryRouter initialEntries={['/campaigns/camp_1/onboarding']}>
        <Routes>
          <Route path="/campaigns/:campaignId/*" element={<CampaignLayout />}>
            <Route path="onboarding" element={<div>Onboarding</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Finish joining Stormwatch')).not.toBeInTheDocument()
    expect(screen.getByText('Onboarding')).toBeInTheDocument()
  })

  it('shows loading chrome while campaign context is unresolved', () => {
    useCampaigns.mockReturnValue({ data: undefined, isPending: true, isError: false })

    render(
      <MemoryRouter initialEntries={['/campaigns/camp_1']}>
        <Routes>
          <Route path="/campaigns/:campaignId/*" element={<CampaignLayout />}>
            <Route index element={<div>Campaign overview</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Loading campaign context…')).toBeInTheDocument()
    expect(screen.queryByText('Finish joining Stormwatch')).not.toBeInTheDocument()
  })

  it('shows an unavailable message when the campaigns query fails', () => {
    useCampaigns.mockReturnValue({ data: undefined, isPending: false, isError: true })

    render(
      <MemoryRouter initialEntries={['/campaigns/camp_1']}>
        <Routes>
          <Route path="/campaigns/:campaignId/*" element={<CampaignLayout />}>
            <Route index element={<div>Campaign overview</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Campaign context unavailable')).toBeInTheDocument()
    expect(screen.queryByText('Finish joining Stormwatch')).not.toBeInTheDocument()
  })
})
