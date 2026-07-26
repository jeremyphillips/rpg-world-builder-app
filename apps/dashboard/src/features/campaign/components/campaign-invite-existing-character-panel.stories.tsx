import type { ComponentType } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { CampaignInviteEligibleCharacter } from '@rpg/contracts'

import { campaignInviteEligibleCharactersQueryKey } from '../hooks/use-campaign-invite-eligible-characters'
import { ExistingCharacterPanel } from './campaign-invite-existing-character-panel.client'

const INVITE_ID = 'invite_1'

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
  {
    characterId: 'char_3',
    name: 'Mira',
    summary: 'Human · Level 1 Cleric',
    eligibility: {
      eligible: false,
      blockingIssues: [
        {
          code: 'conflicting_open_participation',
          conflictingCampaignName: 'The Shattered Vale',
        },
      ],
      warnings: [],
    },
  },
]

function withEligibleCharacters(characters: CampaignInviteEligibleCharacter[]) {
  return [
    (Story: ComponentType) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      queryClient.setQueryData(campaignInviteEligibleCharactersQueryKey(INVITE_ID), characters)
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ] satisfies Meta<typeof ExistingCharacterPanel>['decorators']
}

const meta = {
  title: 'Campaign/CampaignInviteExistingCharacterPanel',
  component: ExistingCharacterPanel,
  parameters: { layout: 'padded' },
  decorators: withEligibleCharacters(eligibleCharacters),
} satisfies Meta<typeof ExistingCharacterPanel>

export default meta
type Story = StoryObj<typeof ExistingCharacterPanel>

export const Default: Story = {
  args: {
    inviteId: INVITE_ID,
    onBack: () => undefined,
  },
}

export const NoCharacters: Story = {
  decorators: withEligibleCharacters([]),
  args: {
    inviteId: INVITE_ID,
    onBack: () => undefined,
  },
}
