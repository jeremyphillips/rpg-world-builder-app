import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignAccessSection } from './campaign-access-section.client'
import * as campaignAccessApi from './campaign-access-api'

vi.mock('./campaign-access-api', () => ({
  fetchContentCampaignAccessAvailability: vi.fn(),
  updateContentCampaignAccess: vi.fn(),
}))

describe('CampaignAccessSection', () => {
  beforeEach(() => {
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockReset()
    vi.mocked(campaignAccessApi.updateContentCampaignAccess).mockReset()
  })

  it('renders availability switch and visibility select', () => {
    render(<CampaignAccessSection campaignId="campaign-1" targetType="feats" entityId="feat-1" />)

    expect(screen.getByLabelText('Available in this campaign')).toBeInTheDocument()
    expect(screen.getByLabelText('Visibility')).toBeInTheDocument()
    expect(screen.getByText('All players')).toBeInTheDocument()
  })

  it('disables specific players with explanatory hint', () => {
    render(<CampaignAccessSection campaignId="campaign-1" targetType="feats" entityId="feat-1" />)

    expect(
      screen.getByText('Set up campaign players before choosing specific players.'),
    ).toBeInTheDocument()
  })

  it('disables visibility when unavailable but keeps the selected value', async () => {
    const user = userEvent.setup()
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockResolvedValue({
      status: 'allowed',
    })
    vi.mocked(campaignAccessApi.updateContentCampaignAccess).mockResolvedValue({
      status: 'updated',
      campaignAccess: {
        available: false,
        visibilityMode: 'dm_only',
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'none',
      },
    })

    render(
      <CampaignAccessSection
        campaignId="campaign-1"
        targetType="feats"
        entityId="feat-1"
        initialAccess={{
          available: true,
          visibilityMode: 'dm_only',
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'dm_only',
        }}
      />,
    )

    await user.click(screen.getByLabelText('Available in this campaign'))

    await waitFor(() => {
      expect(campaignAccessApi.updateContentCampaignAccess).toHaveBeenCalledWith(
        'campaign-1',
        'feats',
        'feat-1',
        expect.objectContaining({ available: false, visibilityMode: 'dm_only' }),
        expect.anything(),
      )
    })

    expect(screen.getByLabelText('Visibility')).toBeDisabled()
  })

  it('tracks create-time draft changes without calling the API', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()

    render(
      <CampaignAccessSection
        campaignId="campaign-1"
        targetType="feats"
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByLabelText('Available in this campaign'))

    expect(campaignAccessApi.updateContentCampaignAccess).not.toHaveBeenCalled()
    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({ available: false, visibilityMode: 'all_players' }),
    )
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <CampaignAccessSection campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )
    await expectNoAxeViolations(container)
  })
})
