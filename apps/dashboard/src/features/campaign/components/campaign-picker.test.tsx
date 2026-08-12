/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'
import { persistCampaignSelectionRemote } from '@rpg/api-client'
import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'
import { makeSessionUser } from '@/test/fixtures/session'

import { CAMPAIGN_ONBOARDING_INDEX_ROW_BODY } from '../lib/campaign-onboarding-copy'
import { CampaignPicker } from './campaign-picker'

import type * as ApiClient from '@rpg/api-client'

vi.mock('@rpg/api-client', async () => {
  const actual = await vi.importActual<typeof ApiClient>('@rpg/api-client')
  return {
    ...actual,
    persistCampaignSelectionRemote: vi.fn(),
  }
})

vi.mock('@/features/campaign/store/campaign-store', () => ({
  useCampaignStore: (selector: (state: { setPreferredCampaignId: () => void }) => unknown) =>
    selector({ setPreferredCampaignId: vi.fn() }),
}))

const persistCampaignSelectionRemoteMock = vi.mocked(persistCampaignSelectionRemote)

describe('CampaignPicker', () => {
  beforeEach(() => {
    persistCampaignSelectionRemoteMock.mockReset()
    persistCampaignSelectionRemoteMock.mockResolvedValue(
      makeSessionUser({ lastSelectedCampaignId: 'camp_1' }),
    )
  })

  it('renders destination links instead of explicit open buttons for complete campaigns', () => {
    renderWithProviders(
      <CampaignPicker
        campaigns={[makeCampaignListItem({ id: 'camp_1', identity: { name: 'Active Campaign' } })]}
      />,
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Your campaigns' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Active Campaign' })).toHaveAttribute(
      'href',
      ROUTES.campaign.detail('camp_1'),
    )
    expect(screen.getByText('Active Campaign')).toHaveClass('font-body-emphasis')
    expect(screen.queryByRole('button', { name: 'Open campaign' })).not.toBeInTheDocument()
  })

  it('renders entry destination links with inline supporting copy for incomplete memberships', () => {
    renderWithProviders(
      <CampaignPicker
        campaigns={[
          makeCampaignListItem({
            id: 'camp_1',
            identity: { name: 'Incomplete Campaign' },
            campaignRole: 'pc',
            controlledCharacterIds: [],
            viewerState: VIEWER_STATE.onboardingIncomplete,
          }),
        ]}
      />,
    )

    const rowLink = screen.getByRole('link', {
      name: 'Open Incomplete Campaign — setup incomplete',
    })

    expect(rowLink).toHaveAttribute('href', ROUTES.campaign.detail('camp_1'))
    expect(screen.getByText(CAMPAIGN_ONBOARDING_INDEX_ROW_BODY)).toBeInTheDocument()
    expect(rowLink).toContainElement(screen.getByText(CAMPAIGN_ONBOARDING_INDEX_ROW_BODY))
    expect(screen.queryByRole('button', { name: 'Continue setup' })).not.toBeInTheDocument()
  })

  it('persists selection on primary row click and still navigates when persistence fails', async () => {
    const user = userEvent.setup()
    persistCampaignSelectionRemoteMock.mockRejectedValue(new Error('network'))

    renderWithProviders(
      <Routes>
        <Route
          path={ROUTES.campaign.list}
          element={
            <CampaignPicker
              campaigns={[
                makeCampaignListItem({ id: 'camp_1', identity: { name: 'Active Campaign' } }),
              ]}
            />
          }
        />
        <Route path="/campaigns/:campaignId" element={<div>Campaign opened</div>} />
      </Routes>,
      { initialEntries: [ROUTES.campaign.list] },
    )

    await user.click(screen.getByRole('link', { name: 'Open Active Campaign' }))

    expect(persistCampaignSelectionRemoteMock).toHaveBeenCalledWith('camp_1', expect.anything())
    expect(await screen.findByText('Campaign opened')).toBeInTheDocument()
  })

  it('does not persist selection on modified clicks', () => {
    renderWithProviders(
      <CampaignPicker
        campaigns={[makeCampaignListItem({ id: 'camp_1', identity: { name: 'Active Campaign' } })]}
      />,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Open Active Campaign' }), {
      metaKey: true,
    })

    expect(persistCampaignSelectionRemoteMock).not.toHaveBeenCalled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <CampaignPicker
        campaigns={[makeCampaignListItem({ identity: { name: 'Active Campaign' } })]}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
