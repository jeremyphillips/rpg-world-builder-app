import type { Meta, StoryObj } from '@storybook/react-vite'

import { CAMPAIGN_UNKNOWN_NAME } from '../../lib/campaign-display'
import {
  CampaignTopbarTitle,
  CampaignTopbarTitleMissing,
  CampaignTopbarTitleSkeleton,
} from '../campaign-topbar-title'

const meta = {
  title: 'Campaign/CampaignTopbarTitle',
  component: CampaignTopbarTitle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignTopbarTitle>

export default meta

type Story = StoryObj<typeof CampaignTopbarTitle>

export const Resolved: Story = {
  args: {
    campaignId: 'camp_1',
    name: 'The Argent Road',
    href: '/campaigns/camp_1',
  },
}

export const LongNameTruncation: Story = {
  args: {
    campaignId: 'camp_1',
    name: 'The Extremely Long Campaign Name That Should Truncate In The Topbar Layout',
    href: '/campaigns/camp_1',
  },
  decorators: [
    (Story) => (
      <div className="flex min-w-0 max-w-sm items-center gap-2 border border-border p-3">
        <Story />
      </div>
    ),
  ],
}

export const Loading: StoryObj<typeof CampaignTopbarTitleSkeleton> = {
  render: () => <CampaignTopbarTitleSkeleton />,
}

export const Missing: StoryObj<typeof CampaignTopbarTitleMissing> = {
  render: () => (
    <CampaignTopbarTitleMissing campaignId="camp_missing" href="/campaigns/camp_missing" />
  ),
  parameters: {
    docs: {
      description: {
        story: `Shows ${CAMPAIGN_UNKNOWN_NAME} when the route id is absent from the loaded list.`,
      },
    },
  },
}
