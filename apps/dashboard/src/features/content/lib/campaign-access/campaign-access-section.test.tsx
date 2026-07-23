import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignAccessSection } from './campaign-access-section.client'
import { CampaignAccessFormProvider } from './campaign-access-form-context.client'
import * as campaignAccessApi from './campaign-access-api'

vi.mock('./campaign-access-api', () => ({
  fetchContentCampaignAccessAvailability: vi.fn(),
  updateContentCampaignAccess: vi.fn(),
}))

function renderSection(ui: ReactElement) {
  return render(<CampaignAccessFormProvider>{ui}</CampaignAccessFormProvider>)
}

async function expandCampaignAccess(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Change' }))
}

describe('CampaignAccessSection', () => {
  beforeEach(() => {
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockReset()
    vi.mocked(campaignAccessApi.updateContentCampaignAccess).mockReset()
  })

  it('renders collapsed summary and expanded availability controls', async () => {
    const user = userEvent.setup()
    renderSection(
      <CampaignAccessSection campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )

    expect(screen.getByText('Campaign availability')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Available/ })).toHaveAccessibleName(
      'Available. All players',
    )
    expect(screen.getByRole('group', { name: /Campaign availability/ })).toHaveClass('mb-0')
    expect(screen.getByRole('group', { name: /Campaign availability/ })).not.toHaveClass('mb-8')

    await expandCampaignAccess(user)

    expect(screen.getByRole('switch', { name: 'Available in this campaign' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Player access' })).toBeInTheDocument()
    expect(screen.getByText('All players')).toBeInTheDocument()
  })

  it('disables specific players with explanatory hint', async () => {
    const user = userEvent.setup()
    renderSection(
      <CampaignAccessSection campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )

    await expandCampaignAccess(user)

    expect(
      screen.getByText('Set up campaign players before choosing specific players.'),
    ).toBeInTheDocument()
  })

  it('marks availability dirty without PATCH on edit toggle', async () => {
    const user = userEvent.setup()
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockResolvedValue({
      status: 'allowed',
    })

    renderSection(
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

    await expandCampaignAccess(user)
    await user.click(screen.getByRole('switch', { name: /Available in this campaign/ }))

    await waitFor(() => {
      expect(campaignAccessApi.fetchContentCampaignAccessAvailability).toHaveBeenCalled()
    })
    expect(campaignAccessApi.updateContentCampaignAccess).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByText(/Unsaved/)).toBeInTheDocument()
  })

  it('tracks create-time draft changes without calling the API', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()

    renderSection(
      <CampaignAccessSection
        campaignId="campaign-1"
        targetType="feats"
        onDraftChange={onDraftChange}
      />,
    )

    await expandCampaignAccess(user)
    await user.click(screen.getByRole('switch', { name: 'Available in this campaign' }))

    expect(campaignAccessApi.updateContentCampaignAccess).not.toHaveBeenCalled()
    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({ available: false, visibilityMode: 'all_players' }),
    )
  })

  it('shows unavailable summary without opening the disclosure', () => {
    renderSection(
      <CampaignAccessSection
        campaignId="campaign-1"
        targetType="feats"
        entityId="feat-1"
        initialAccess={{
          available: false,
          visibilityMode: 'dm_only',
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'none',
        }}
      />,
    )

    expect(screen.getByRole('button', { name: /Unavailable/ })).toHaveAccessibleName(
      'Unavailable. DM only. Hidden from discovery and selection in this campaign.',
    )
    expect(
      screen.getByText('Hidden from discovery and selection in this campaign.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
  })

  it('restores availability toggle when preflight is blocked', async () => {
    const user = userEvent.setup()
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockResolvedValue({
      status: 'blocked',
      blockers: [{ kind: 'rule', code: 'npc_reference', message: 'Referenced by an NPC.' }],
    })

    renderSection(
      <CampaignAccessSection
        campaignId="campaign-1"
        targetType="feats"
        entityId="feat-1"
        initialAccess={{
          available: true,
          visibilityMode: 'all_players',
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'all_players',
        }}
      />,
    )

    await expandCampaignAccess(user)
    await user.click(screen.getByRole('switch', { name: /Available in this campaign/ }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(campaignAccessApi.updateContentCampaignAccess).not.toHaveBeenCalled()
  })

  it('has no axe violations', async () => {
    const { container } = renderSection(
      <CampaignAccessSection campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )
    await expectNoAxeViolations(container)
  })
})
