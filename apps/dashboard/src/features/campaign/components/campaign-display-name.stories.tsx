import type { Meta, StoryObj } from '@storybook/react-vite'

import { CampaignDisplayName } from './campaign-display-name'

const display = {
  id: 'camp_1',
  name: 'The Argent Road',
  imageUrl: null,
} as const

const meta = {
  title: 'Campaign/CampaignDisplayName',
  component: CampaignDisplayName,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignDisplayName>

export default meta

type Story = StoryObj<typeof CampaignDisplayName>

export const Topbar: Story = {
  args: {
    display,
    surface: 'topbar',
    href: '/campaigns/camp_1',
    asLink: true,
  },
}

export const Card: Story = {
  args: {
    display,
    surface: 'card',
  },
}

export const InlineMuted: Story = {
  args: {
    display,
    surface: 'inlineMuted',
  },
}

export const SwitcherTrigger: Story = {
  args: {
    display,
    surface: 'switcherTrigger',
  },
}

export const MenuItem: Story = {
  args: {
    display,
    surface: 'menuItem',
  },
}
