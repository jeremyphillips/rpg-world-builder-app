import type { Meta, StoryObj } from '@storybook/react-vite'
import { createDefaultCampaignRosterState, createDefaultCharacterVitalState } from '@rpg/contracts'

import { CampaignCharacterStatusSummary } from './campaign-character-status-summary'

const meta = {
  title: 'Dashboard/Character/CampaignCharacterStatusSummary',
  component: CampaignCharacterStatusSummary,
  args: {
    vital: createDefaultCharacterVitalState(),
    roster: createDefaultCampaignRosterState(),
  },
} satisfies Meta<typeof CampaignCharacterStatusSummary>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const RetiredDeceased: Story = {
  args: {
    roster: { status: 'retired', note: 'Left after the siege.' },
    vital: { status: 'deceased', note: 'Fell defending the gate.' },
  },
}
