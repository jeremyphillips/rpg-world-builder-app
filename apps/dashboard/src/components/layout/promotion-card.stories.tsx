import type { Meta, StoryObj } from '@storybook/react-vite'
import { ButtonLink } from '@rpg/ui'
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
      <ButtonLink link={<a href="/app/campaign-invites/abc" />} size="sm">
        Review invitation
      </ButtonLink>
    ),
  },
}

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Finish joining Stormwatch',
    description: 'Create or connect a character to complete your campaign setup.',
    actions: (
      <ButtonLink link={<Link to="/campaigns/camp_1/onboarding" />} variant="outline" size="sm">
        Continue setup
      </ButtonLink>
    ),
  },
}
