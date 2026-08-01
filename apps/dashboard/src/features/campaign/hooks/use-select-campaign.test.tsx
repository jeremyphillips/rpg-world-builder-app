/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeTestQueryClient } from '@/test/render'

vi.mock('@rpg/api-client', () => ({
  persistCampaignSelectionLocal: vi.fn(),
  persistCampaignSelectionRemote: vi.fn(),
}))

vi.mock('@/features/campaign/store/campaign-store', () => ({
  useCampaignStore: (selector: (state: { setPreferredCampaignId: () => void }) => unknown) =>
    selector({ setPreferredCampaignId: vi.fn() }),
}))

const { useCampaigns } = vi.hoisted(() => ({
  useCampaigns: vi.fn(),
}))

vi.mock('./use-campaigns', () => ({
  useCampaigns,
}))

import { useOpenCampaign, useSwitchCampaign } from './use-select-campaign'

function PathnameProbe() {
  const { pathname } = useLocation()
  return <div data-testid="pathname">{pathname}</div>
}

function renderCampaignSelectionHarness(ui: ReactNode, initialEntries: string[]) {
  const queryClient = makeTestQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/campaigns/:campaignId/*"
            element={
              <>
                {ui}
                <PathnameProbe />
              </>
            }
          />
          <Route
            path="*"
            element={
              <>
                {ui}
                <PathnameProbe />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function OpenCampaignButton() {
  const openCampaign = useOpenCampaign()
  return (
    <button type="button" onClick={() => openCampaign('camp_2')}>
      Open campaign
    </button>
  )
}

function SwitchCampaignButton() {
  const switchCampaign = useSwitchCampaign()
  return (
    <button type="button" onClick={() => switchCampaign('camp_2')}>
      Switch campaign
    </button>
  )
}

describe('useOpenCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCampaigns.mockReturnValue({
      data: [
        makeCampaignListItem({ id: 'camp_2', viewerOnboardingState: 'complete' }),
        makeCampaignListItem({ id: 'camp_incomplete', viewerOnboardingState: 'incomplete' }),
      ],
    })
  })

  it('navigates to campaign overview for complete onboarding', async () => {
    const user = userEvent.setup()
    renderCampaignSelectionHarness(<OpenCampaignButton />, ['/campaigns'])

    await user.click(screen.getByRole('button', { name: 'Open campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent('/campaigns/camp_2')
  })

  it('navigates to onboarding for incomplete campaigns', async () => {
    useCampaigns.mockReturnValue({
      data: [makeCampaignListItem({ id: 'camp_2', viewerOnboardingState: 'incomplete' })],
    })

    const user = userEvent.setup()
    renderCampaignSelectionHarness(<OpenCampaignButton />, ['/campaigns'])

    await user.click(screen.getByRole('button', { name: 'Open campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(ROUTES.campaign.onboarding('camp_2'))
  })
})

describe('useSwitchCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCampaigns.mockReturnValue({
      data: [
        makeCampaignListItem({ id: 'camp_1', viewerOnboardingState: 'complete' }),
        makeCampaignListItem({ id: 'camp_2', viewerOnboardingState: 'complete' }),
      ],
    })
  })

  it('preserves the current section when switching on a campaign route', async () => {
    const user = userEvent.setup()
    renderCampaignSelectionHarness(<SwitchCampaignButton />, ['/campaigns/camp_1/spells'])

    await user.click(screen.getByRole('button', { name: 'Switch campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent('/campaigns/camp_2/spells')
  })

  it('routes incomplete campaigns to onboarding when switching from overview', async () => {
    useCampaigns.mockReturnValue({
      data: [
        makeCampaignListItem({ id: 'camp_1', viewerOnboardingState: 'complete' }),
        makeCampaignListItem({ id: 'camp_2', viewerOnboardingState: 'incomplete' }),
      ],
    })

    const user = userEvent.setup()
    renderCampaignSelectionHarness(<SwitchCampaignButton />, ['/campaigns/camp_1'])

    await user.click(screen.getByRole('button', { name: 'Switch campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(ROUTES.campaign.onboarding('camp_2'))
  })

  it('falls back to overview when switching from a non-campaign route', async () => {
    const user = userEvent.setup()
    renderCampaignSelectionHarness(<SwitchCampaignButton />, ['/campaigns'])

    await user.click(screen.getByRole('button', { name: 'Switch campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(ROUTES.campaign.detail('camp_2'))
  })
})
