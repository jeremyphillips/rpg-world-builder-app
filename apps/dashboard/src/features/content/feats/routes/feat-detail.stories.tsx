import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { ALERT, GRAPPLER, MAGIC_INITIATE } from '../fixtures'
import { FeatDetailContent } from './feat-detail'

const meta = {
  title: 'Content/Feats/FeatDetail',
  component: FeatDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof FeatDetailContent>

export default meta
type Story = StoryObj

export const OriginFeat: Story = {
  render: () => <FeatDetailContent feat={ALERT} campaignId="camp_story" />,
}

export const GeneralFeatWithPrerequisite: Story = {
  render: () => <FeatDetailContent feat={GRAPPLER} campaignId="camp_story" />,
}

export const RepeatableFeat: Story = {
  render: () => <FeatDetailContent feat={MAGIC_INITIATE} campaignId="camp_story" />,
}
