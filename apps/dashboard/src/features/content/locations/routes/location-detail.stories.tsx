import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { sessionQueryKey } from '@/features/auth'
import { campaignsQueryKey } from '@/features/campaign'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { DOCK_WARD, HARBORFORD, LOCATIONS_LIST } from '../fixtures'
import { LocationDetailContent } from './location-detail'

function createLocationDetailQueryClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(sessionQueryKey, makeAuthMe(makeSessionUser()))
  client.setQueryData(campaignsQueryKey, [
    makeCampaignListItem({ id: STORY_CAMPAIGN_ID, campaignRole: 'owner' }),
  ])
  return client
}

const meta = {
  title: 'Content/Locations/LocationDetail',
  component: LocationDetailContent,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={createLocationDetailQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof LocationDetailContent>

export default meta
type Story = StoryObj<typeof meta>

export const SettlementWithChildren: Story = {
  args: {
    location: HARBORFORD,
    campaignId: STORY_CAMPAIGN_ID,
    locations: [...LOCATIONS_LIST],
  },
}

export const DistrictWithAncestry: Story = {
  args: {
    location: DOCK_WARD,
    campaignId: STORY_CAMPAIGN_ID,
    locations: [...LOCATIONS_LIST],
  },
}
