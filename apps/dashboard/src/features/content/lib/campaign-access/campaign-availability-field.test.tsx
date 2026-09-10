import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CampaignAvailabilityField } from './campaign-availability-field'
import { CampaignAccessFormProvider } from './campaign-access-form-context'
import * as campaignAccessApi from './campaign-access-api'
import * as participantRoster from './use-campaign-access-participant-roster'

vi.mock('./campaign-access-api', () => ({
  fetchContentCampaignAccessAvailability: vi.fn(),
  updateContentCampaignAccess: vi.fn(),
}))

vi.mock('./use-campaign-access-participant-roster', () => ({
  useCampaignAccessParticipantRoster: vi.fn(() => ({ data: [] })),
}))

function renderField(ui: ReactElement) {
  return render(<CampaignAccessFormProvider>{ui}</CampaignAccessFormProvider>)
}

async function expandInlineAvailability(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Available|Unavailable/ }))
}

async function expandDialogAvailability(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Campaign availability' }))
}

describe('CampaignAvailabilityField', () => {
  beforeEach(() => {
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockReset()
    vi.mocked(campaignAccessApi.updateContentCampaignAccess).mockReset()
    vi.mocked(participantRoster.useCampaignAccessParticipantRoster).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof participantRoster.useCampaignAccessParticipantRoster>)
  })

  it('renders collapsed summary and expanded availability controls', async () => {
    const user = userEvent.setup()
    renderField(
      <CampaignAvailabilityField campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )

    expect(screen.getByText('Campaign availability')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Available/ })).toHaveAccessibleName(
      'Available. All players',
    )
    expect(screen.getByRole('group', { name: /Campaign availability/ })).toHaveClass('mb-0')
    expect(screen.getByRole('group', { name: /Campaign availability/ })).not.toHaveClass('mb-8')

    await expandInlineAvailability(user)

    expect(screen.getByRole('switch', { name: 'Available in this campaign' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Player access' })).toBeInTheDocument()
    expect(screen.getByText('All players')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('opens the editor in a dialog when presentation is dialog', async () => {
    const user = userEvent.setup()
    renderField(
      <CampaignAvailabilityField
        campaignId="campaign-1"
        targetType="feats"
        entityId="feat-1"
        presentation="dialog"
      />,
    )

    expect(
      screen.getByText('Controls where this content can be discovered and used.'),
    ).toBeInTheDocument()
    await expandDialogAvailability(user)

    const dialog = screen.getByRole('dialog', { name: 'Campaign availability' })
    expect(screen.getByRole('switch', { name: 'Available in this campaign' })).toBeInTheDocument()
    expect(dialog).toContainElement(screen.getByRole('button', { name: 'Done' }))

    await user.click(screen.getByRole('button', { name: 'Done' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('uses compact label scale when density is compact', async () => {
    const user = userEvent.setup()
    renderField(
      <CampaignAvailabilityField
        campaignId="campaign-1"
        targetType="feats"
        entityId="feat-1"
        density="compact"
      />,
    )

    expect(screen.getByText('Campaign availability')).toHaveClass('text-xs')

    await expandInlineAvailability(user)

    expect(screen.getByText('Available in this campaign')).toHaveClass('text-xs')
    expect(screen.getByRole('combobox', { name: 'Player access' })).toHaveClass('text-xs')
  })

  it('shows the participant picker inset behind a rail when specific players is selected', async () => {
    vi.mocked(participantRoster.useCampaignAccessParticipantRoster).mockReturnValue({
      data: [{ id: 'pc-1', name: 'Aldric', playerDisplayName: 'Player One' }],
    } as unknown as ReturnType<typeof participantRoster.useCampaignAccessParticipantRoster>)

    const { container } = renderField(
      <CampaignAvailabilityField
        campaignId="campaign-1"
        targetType="feats"
        entityId="feat-1"
        initialAccess={{
          available: true,
          visibilityMode: 'specific_players',
          participantIds: [],
          unavailableParticipantIds: [],
          effectiveAudience: 'specific_players',
        }}
      />,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: /Available/ }))

    const rail = container.querySelector('[data-field-dependent-rail]')
    expect(rail).toBeInTheDocument()
    expect(rail).toContainElement(screen.getByRole('combobox', { name: 'Selected players' }))
    expect(rail).not.toContainElement(screen.getByRole('combobox', { name: 'Player access' }))
  })

  it('hides the participant rail while player access is not specific players', async () => {
    vi.mocked(participantRoster.useCampaignAccessParticipantRoster).mockReturnValue({
      data: [{ id: 'pc-1', name: 'Aldric', playerDisplayName: 'Player One' }],
    } as unknown as ReturnType<typeof participantRoster.useCampaignAccessParticipantRoster>)

    const { container } = renderField(
      <CampaignAvailabilityField campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )

    await userEvent.setup().click(screen.getByRole('button', { name: /Available/ }))

    expect(screen.getByRole('combobox', { name: 'Player access' })).toBeInTheDocument()
    expect(container.querySelector('[data-field-dependent-rail]')).not.toBeInTheDocument()
  })

  it('marks availability dirty without PATCH on edit toggle', async () => {
    const user = userEvent.setup()
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockResolvedValue({
      status: 'allowed',
    })

    renderField(
      <CampaignAvailabilityField
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

    await expandInlineAvailability(user)
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

    renderField(
      <CampaignAvailabilityField
        campaignId="campaign-1"
        targetType="feats"
        onDraftChange={onDraftChange}
      />,
    )

    await expandInlineAvailability(user)
    await user.click(screen.getByRole('switch', { name: 'Available in this campaign' }))

    expect(campaignAccessApi.updateContentCampaignAccess).not.toHaveBeenCalled()
    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({ available: false, visibilityMode: 'all_players' }),
    )
  })

  it('shows unavailable summary without opening the disclosure', () => {
    renderField(
      <CampaignAvailabilityField
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
      'Unavailable. DM only',
    )
    expect(
      screen.queryByText('Hidden from discovery and selection in this campaign.'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
  })

  it('restores availability toggle when preflight is blocked', async () => {
    const user = userEvent.setup()
    vi.mocked(campaignAccessApi.fetchContentCampaignAccessAvailability).mockResolvedValue({
      status: 'blocked',
      blockers: [{ kind: 'rule', code: 'npc_reference', message: 'Referenced by an NPC.' }],
    })

    renderField(
      <CampaignAvailabilityField
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

    await expandInlineAvailability(user)
    await user.click(screen.getByRole('switch', { name: /Available in this campaign/ }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(campaignAccessApi.updateContentCampaignAccess).not.toHaveBeenCalled()
  })

  itAxe('has no axe violations', async () => {
    const { container } = renderField(
      <CampaignAvailabilityField campaignId="campaign-1" targetType="feats" entityId="feat-1" />,
    )
    await expectNoAxeViolations(container)
  })
})
