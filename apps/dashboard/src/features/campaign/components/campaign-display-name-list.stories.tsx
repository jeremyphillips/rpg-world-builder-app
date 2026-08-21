import type { Meta, StoryObj } from '@storybook/react-vite'

import { CampaignDisplayNameList } from './campaign-display-name-list'

const displays = [
  { id: 'camp_1', name: 'Curse of Strahd', imageUrl: null },
  { id: 'camp_2', name: 'Lost Mine', imageUrl: null },
] as const

const meta = {
  title: 'Campaign/CampaignDisplayNameList',
  component: CampaignDisplayNameList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignDisplayNameList>

export default meta

type Story = StoryObj<typeof CampaignDisplayNameList>

export const InlineMuted: Story = {
  args: {
    surface: 'inlineMuted',
    displays: [...displays],
    getHref: (display) => `/campaigns/${display.id}`,
  },
}

export const ThreeCampaigns: Story = {
  args: {
    surface: 'inlineMuted',
    displays: [...displays, { id: 'camp_3', name: 'Storm King', imageUrl: null }],
    getHref: (display) => `/campaigns/${display.id}`,
  },
}
