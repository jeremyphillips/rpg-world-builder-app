import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import type { CampaignInviteEligibleCharacter } from '@rpg/contracts'

import { ExistingCharacterPanel } from './campaign-invite-existing-character-panel.client'

const eligibleCharacters: CampaignInviteEligibleCharacter[] = [
  {
    characterId: 'char_1',
    name: 'Verna',
    summary: 'Dwarf · Level 1 Fighter',
    eligibility: { eligible: true, blockingIssues: [], warnings: [] },
  },
  {
    characterId: 'char_2',
    name: 'Theron',
    summary: 'Elf · Level 3 Wizard',
    eligibility: {
      eligible: false,
      blockingIssues: [{ code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 }],
      warnings: [],
    },
  },
]

const mutateAsync = vi.fn()

vi.mock('../hooks/use-campaign-invite-eligible-characters', () => ({
  useCampaignInviteEligibleCharacters: () => ({
    data: eligibleCharacters,
    isPending: false,
    isError: false,
  }),
  useCompleteCampaignInviteWithExistingCharacter: () => ({
    mutateAsync,
    isPending: false,
  }),
}))

function renderPanel() {
  return render(
    <MemoryRouter>
      <ExistingCharacterPanel inviteId="invite_1" onBack={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('ExistingCharacterPanel', () => {
  it('renders disabled combobox descriptions for blocking issues', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('combobox', { name: 'Character' }))

    expect(screen.getByText('Campaign starts at level 1')).toBeInTheDocument()
    expect(screen.getByText('Verna')).toBeInTheDocument()
  })

  it('submits the selected eligible character', async () => {
    const user = userEvent.setup()
    mutateAsync.mockResolvedValueOnce({ campaignId: 'camp_1', characterId: 'char_1' })
    renderPanel()

    await user.click(screen.getByRole('combobox', { name: 'Character' }))
    await user.click(screen.getByRole('option', { name: /Verna/i }))
    await user.click(screen.getByRole('button', { name: 'Add character to campaign' }))

    expect(mutateAsync).toHaveBeenCalledWith('char_1')
  })
})
