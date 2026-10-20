import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from 'react-router-dom'
import { ButtonLink } from '@rpg/ui'

import { StarterActionCard } from './starter-action-card'

const meta = {
  title: 'Layout/StarterActionCard',
  component: StarterActionCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StarterActionCard>

export default meta

type Story = StoryObj<typeof StarterActionCard>

export const Campaign: Story = {
  args: {
    title: 'Create a campaign',
    description: 'Build a shared world, invite players, and manage characters and game content.',
    actions: (
      <ButtonLink link={<Link to="/campaigns/new" />} size="sm">
        New campaign
      </ButtonLink>
    ),
  },
}

export const Character: Story = {
  args: {
    title: 'Create a character',
    description: 'Build a standalone character now. You can connect it to a campaign later.',
    actions: (
      <>
        <ButtonLink link={<Link to="/characters/new" />} size="sm">
          Create character
        </ButtonLink>
        <ButtonLink link={<Link to="/characters/import" />} variant="outline" size="sm">
          Import character
        </ButtonLink>
      </>
    ),
  },
}
