import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ApiError,
  CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE,
  type CampaignEligibleCharacter,
} from '@rpg/contracts'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CampaignOnboardingExistingCharacterPanel } from './campaign-onboarding-existing-character-panel.client'

const mutateAsync = vi.fn()
const navigate = vi.fn()
const onBack = vi.fn()

const eligibleCharacter: CampaignEligibleCharacter = {
  characterId: 'char_eligible',
  name: 'Aldric',
  summary: 'Level 1 fighter',
  eligibility: {
    eligible: true,
    blockingIssues: [],
    warnings: [],
  },
}

const ineligibleCharacter: CampaignEligibleCharacter = {
  characterId: 'char_blocked',
  name: 'Bryn',
  summary: 'Level 3 fighter',
  eligibility: {
    eligible: false,
    blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
    warnings: [],
  },
}

let queryState: {
  data: CampaignEligibleCharacter[] | undefined
  isPending: boolean
  isError: boolean
  isRefetching: boolean
  refetch: ReturnType<typeof vi.fn>
} = {
  data: [eligibleCharacter, ineligibleCharacter],
  isPending: false,
  isError: false,
  isRefetching: false,
  refetch: vi.fn(),
}

vi.mock('../hooks/use-campaign-onboarding-eligible-characters', () => ({
  useCampaignOnboardingEligibleCharacters: () => queryState,
  useCompleteCampaignOnboarding: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

function renderPanel() {
  return render(<CampaignOnboardingExistingCharacterPanel campaignId="camp_1" onBack={onBack} />)
}

describe('CampaignOnboardingExistingCharacterPanel', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    navigate.mockReset()
    onBack.mockReset()
    queryState = {
      data: [eligibleCharacter, ineligibleCharacter],
      isPending: false,
      isError: false,
      isRefetching: false,
      refetch: vi.fn(),
    }
  })

  it('shows a load error when eligible characters cannot be fetched', () => {
    queryState = {
      data: undefined,
      isPending: false,
      isError: true,
      isRefetching: false,
      refetch: vi.fn(),
    }

    renderPanel()

    expect(screen.getByText('Could not load your characters.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('retries loading eligible characters when Try again is clicked', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    queryState = {
      data: undefined,
      isPending: false,
      isError: true,
      isRefetching: false,
      refetch,
    }

    renderPanel()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('submits the selected eligible character and navigates to campaign PC detail', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValueOnce({ campaignId: 'camp_1', characterId: 'char_eligible' })
    renderPanel()

    await user.click(screen.getByRole('combobox', { name: 'Character' }))
    await user.click(screen.getByRole('option', { name: /aldric/i }))
    await user.click(screen.getByRole('button', { name: 'Add character to campaign' }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        source: 'existing',
        characterId: 'char_eligible',
      })
    })
    expect(navigate).toHaveBeenCalledWith('/campaigns/camp_1/characters/char_eligible')
  })

  it('shows eligibility feedback when completion is rejected', async () => {
    const user = userEvent.setup()
    mutateAsync.mockRejectedValueOnce(
      new ApiError(422, CAMPAIGN_CHARACTER_ASSIGNMENT_ERROR_CODE, 'Not eligible', {
        kind: 'campaign_ineligible',
        blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
        warnings: [],
      }),
    )
    renderPanel()

    await user.click(screen.getByRole('combobox', { name: 'Character' }))
    await user.click(screen.getByRole('option', { name: /aldric/i }))
    await user.click(screen.getByRole('button', { name: 'Add character to campaign' }))

    expect(
      await screen.findByText('This character can no longer join the campaign:'),
    ).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('has no axe accessibility violations in the loaded state', async () => {
    const { container } = renderPanel()

    await expectNoAxeViolations(container)
  })
})
