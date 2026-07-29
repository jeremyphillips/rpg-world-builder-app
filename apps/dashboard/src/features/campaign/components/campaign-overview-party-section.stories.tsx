import type { Meta, StoryObj } from '@storybook/react-vite'

import { CampaignOverviewPartySection } from './campaign-overview-party-section'

const meta = {
  title: 'Campaign/CampaignOverviewPartySection',
  component: CampaignOverviewPartySection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignOverviewPartySection>

export default meta
type Story = StoryObj<typeof CampaignOverviewPartySection>

export const Empty: Story = {
  args: {
    campaignId: 'camp_1',
    viewerControlledCharacterIds: [],
    party: [],
  },
}

export const WithPartyPc: Story = {
  args: {
    campaignId: 'camp_1',
    viewerControlledCharacterIds: [],
    party: [
      {
        character: {
          id: 'char_1',
          name: 'Verna',
          summary: 'Dwarf · Level 1 Fighter',
          campaign: { id: 'camp_1', name: 'The Argent Road' },
        },
        member: {
          id: 'member_1',
          displayName: 'Player One',
        },
        roster: { status: 'active' },
      },
    ],
  },
}

export const PlayedByYou: Story = {
  args: {
    campaignId: 'camp_1',
    viewerControlledCharacterIds: ['char_1'],
    party: [
      {
        character: {
          id: 'char_1',
          name: 'Verna',
          summary: 'Dwarf · Level 1 Fighter',
          campaign: { id: 'camp_1', name: 'The Argent Road' },
        },
        member: {
          id: 'member_1',
          displayName: 'Player One',
        },
        roster: { status: 'active' },
      },
    ],
  },
}

export const Unassigned: Story = {
  args: {
    campaignId: 'camp_1',
    viewerControlledCharacterIds: [],
    party: [
      {
        character: {
          id: 'char_2',
          name: 'Unassigned PC',
          summary: 'Human · Level 1 Wizard',
          campaign: { id: 'camp_1', name: 'The Argent Road' },
        },
        member: null,
        roster: { status: 'inactive' },
      },
    ],
  },
}
