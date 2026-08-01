import type { Meta, StoryObj } from '@storybook/react-vite'
import { buttonVariants } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { PromotionCard } from './promotion-card'

const meta = {
  title: 'Layout/PromotionCard',
  component: PromotionCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PromotionCard>

export default meta

type Story = StoryObj<typeof PromotionCard>

export const Default: Story = {
  args: {
    title: 'Campaign invitation',
    description: 'The Shattered Vale. Avery invited you to join this campaign.',
    meta: 'Expires in 7 days',
    actions: (
      <a href="/app/campaign-invites/abc" className={buttonVariants({ size: 'sm' })}>
        Review invitation
      </a>
    ),
  },
}

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Finish joining Stormwatch',
    description: 'Create or connect a character to complete your campaign setup.',
    actions: (
      <Link
        to="/campaigns/camp_1/onboarding"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Continue setup
      </Link>
    ),
  },
}
