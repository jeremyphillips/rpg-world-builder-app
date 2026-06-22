import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CHAIN_MAIL, LEATHER, SHIELD } from '../fixtures'
import { ArmorDetailContent } from './armor-detail'

const meta = {
  title: 'Content/Armor/ArmorDetail',
  component: ArmorDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof ArmorDetailContent>

export default meta
type Story = StoryObj

export const LightArmor: Story = {
  render: () => <ArmorDetailContent item={LEATHER} campaignId={STORY_CAMPAIGN_ID} />,
}

export const HeavyArmor: Story = {
  render: () => <ArmorDetailContent item={CHAIN_MAIL} campaignId={STORY_CAMPAIGN_ID} />,
}

export const Shield: Story = {
  render: () => <ArmorDetailContent item={SHIELD} campaignId={STORY_CAMPAIGN_ID} />,
}
