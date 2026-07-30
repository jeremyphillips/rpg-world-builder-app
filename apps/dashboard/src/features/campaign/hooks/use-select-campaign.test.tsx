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
import { makeTestQueryClient } from '@/test/render'

vi.mock('@/features/campaign/api/campaign-client', () => ({
  rememberSelectedCampaign: vi.fn(),
}))

vi.mock('@/features/campaign/store/campaign-store', () => ({
  useCampaignStore: (selector: (state: { setPreferredCampaignId: () => void }) => unknown) =>
    selector({ setPreferredCampaignId: vi.fn() }),
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
  })

  it('navigates to campaign overview', async () => {
    const user = userEvent.setup()
    renderCampaignSelectionHarness(<OpenCampaignButton />, ['/campaigns'])

    await user.click(screen.getByRole('button', { name: 'Open campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent('/campaigns/camp_2')
  })
})

describe('useSwitchCampaign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('preserves the current section when switching on a campaign route', async () => {
    const user = userEvent.setup()
    renderCampaignSelectionHarness(<SwitchCampaignButton />, ['/campaigns/camp_1/spells'])

    await user.click(screen.getByRole('button', { name: 'Switch campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent('/campaigns/camp_2/spells')
  })

  it('falls back to overview when switching from a non-campaign route', async () => {
    const user = userEvent.setup()
    renderCampaignSelectionHarness(<SwitchCampaignButton />, ['/campaigns'])

    await user.click(screen.getByRole('button', { name: 'Switch campaign' }))

    expect(screen.getByTestId('pathname')).toHaveTextContent(ROUTES.campaign.detail('camp_2'))
  })
})
