import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CharacterCampaignBlockingIssue, CharacterCampaignWarning } from '@rpg/contracts'

import { CampaignCharacterEligibilityAlert } from './campaign-character-eligibility-alert.client'

const blockingIssues: CharacterCampaignBlockingIssue[] = [
  { code: 'level_mismatch', actualLevel: 3, requiredLevel: 1 },
  { code: 'species_unavailable', contentId: 'species:elf', label: 'Elf' },
]

const warnings: CharacterCampaignWarning[] = [
  {
    code: 'content_unavailable',
    category: 'spells',
    contentId: 'spell:shield',
    label: 'Shield is not available in this campaign',
  },
]

const meta = {
  title: 'Campaign/CampaignCharacterEligibilityAlert',
  component: CampaignCharacterEligibilityAlert,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignCharacterEligibilityAlert>

export default meta

type Story = StoryObj<typeof CampaignCharacterEligibilityAlert>

export const SingleBlockingIssue: Story = {
  args: {
    blockingIssues: [blockingIssues[0]!],
  },
}

export const MultipleBlockingIssuesWithWarnings: Story = {
  args: {
    blockingIssues,
    warnings,
    heading: 'This character can no longer join the campaign:',
  },
}
