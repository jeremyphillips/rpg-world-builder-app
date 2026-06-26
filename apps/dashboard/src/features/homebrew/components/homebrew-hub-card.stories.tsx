import type { Meta, StoryObj } from '@storybook/react-vite'

import { HomebrewHubCard } from './homebrew-hub-card'

const meta = {
  title: 'Layout/Homebrew/HomebrewHubCard',
  component: HomebrewHubCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof HomebrewHubCard>

export default meta
type Story = StoryObj

export const ViewOnly: Story = {
  render: () => (
    <HomebrewHubCard
      title="Creature Types"
      description="Manage campaign vocabulary options"
      viewHref="/campaigns/camp_1/homebrew/vocabulary/creature-types"
    />
  ),
}

export const WithCreate: Story = {
  render: () => (
    <HomebrewHubCard
      title="Classes"
      description="12 items available"
      viewHref="/campaigns/camp_1/classes"
      createHref="/campaigns/camp_1/classes/new"
      showCreate
    />
  ),
}
