import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { CampaignEligibleCharacter } from '@rpg/contracts'

import { withDashboardProviders } from '../../../../.storybook/decorators'

import { campaignOnboardingEligibleCharactersQueryKey } from '../hooks/use-campaign-onboarding-eligible-characters'
import { CampaignOnboardingExistingCharacterPanel } from './campaign-onboarding-existing-character-panel.client'

const CAMPAIGN_ID = 'camp_1'

const eligibleCharacter: CampaignEligibleCharacter = {
  characterId: 'char_eligible',
  name: 'Aldric',
  summary: 'Level 1 fighter',
  eligibility: {
    eligible: true,
    blockingIssues: [],
    warnings: [
      {
        code: 'content_unavailable',
        category: 'equipment',
        contentId: 'item:longbow',
        label: 'Longbow is restricted in this campaign',
      },
    ],
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

function withEligibleCharacters(characters: CampaignEligibleCharacter[]): Meta['decorators'] {
  return [
    withDashboardProviders,
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      queryClient.setQueryData(
        campaignOnboardingEligibleCharactersQueryKey(CAMPAIGN_ID),
        characters,
      )
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ]
}

const meta = {
  title: 'Campaign/CampaignOnboardingExistingCharacterPanel',
  component: CampaignOnboardingExistingCharacterPanel,
  parameters: { layout: 'padded' },
  args: {
    campaignId: CAMPAIGN_ID,
    onBack: () => undefined,
  },
} satisfies Meta<typeof CampaignOnboardingExistingCharacterPanel>

export default meta

type Story = StoryObj<typeof CampaignOnboardingExistingCharacterPanel>

export const Loaded: Story = {
  decorators: withEligibleCharacters([eligibleCharacter, ineligibleCharacter]),
}

export const NoCharacters: Story = {
  decorators: withEligibleCharacters([]),
}

export const NoEligibleCharacters: Story = {
  decorators: withEligibleCharacters([ineligibleCharacter]),
}

export const LoadError: Story = {
  decorators: [
    withDashboardProviders,
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      queryClient.setQueryDefaults(campaignOnboardingEligibleCharactersQueryKey(CAMPAIGN_ID), {
        queryFn: async () => {
          throw new Error('Could not load eligible characters.')
        },
      })
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ],
}
