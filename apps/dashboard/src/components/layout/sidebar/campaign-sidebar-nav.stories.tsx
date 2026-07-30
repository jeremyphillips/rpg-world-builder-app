import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { campaignsQueryKey } from '@/features/campaign'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignSidebarNav } from './campaign-sidebar-nav'

const campaignId = 'camp_demo'

function createCampaignSidebarQueryClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  client.setQueryData(campaignsQueryKey, [makeCampaignListItem({ id: campaignId })])
  return client
}

const meta = {
  title: 'Layout/Sidebar/CampaignSidebarNav',
  component: CampaignSidebarNav,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={createCampaignSidebarQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof CampaignSidebarNav>

export default meta
type Story = StoryObj<typeof CampaignSidebarNav>

export const Default: Story = {
  args: {
    campaignId,
  },
  render: (args) => (
    <div className="w-60 bg-sidebar">
      <CampaignSidebarNav {...args} />
    </div>
  ),
}
