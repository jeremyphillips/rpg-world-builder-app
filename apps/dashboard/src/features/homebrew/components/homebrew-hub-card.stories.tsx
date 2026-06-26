import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'

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
    <MemoryRouter>
      <HomebrewHubCard
        title="Creature Types"
        description="Manage campaign vocabulary options"
        viewHref="/campaigns/camp_1/homebrew/vocabulary/creature-types"
      />
    </MemoryRouter>
  ),
}

export const WithCreate: Story = {
  render: () => (
    <MemoryRouter>
      <HomebrewHubCard
        title="Classes"
        description="12 items available"
        viewHref="/campaigns/camp_1/classes"
        createHref="/campaigns/camp_1/classes/new"
        showCreate
      />
    </MemoryRouter>
  ),
}
