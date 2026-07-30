import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

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
      <Link to="/campaigns/new" className={buttonVariants({ size: 'sm' })}>
        New campaign
      </Link>
    ),
  },
}

export const Character: Story = {
  args: {
    title: 'Create a character',
    description: 'Build a standalone character now. You can connect it to a campaign later.',
    actions: (
      <>
        <Link to="/characters/new" className={buttonVariants({ size: 'sm' })}>
          Create character
        </Link>
        <Link
          to="/characters/import"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Import character
        </Link>
      </>
    ),
  },
}
