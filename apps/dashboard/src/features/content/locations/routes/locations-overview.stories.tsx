import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { sessionQueryKey } from '@/features/auth'
import { campaignsQueryKey } from '@/features/campaign'
import {
  formatContentCollectionAvailabilityCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { ContentOverviewShell } from '@/features/content/lib/overview/content-overview-shell'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LocationCreateActions } from '../components/create/location-create-actions'
import { LOCATIONS_LIST } from '../fixtures'
import { locationsColumns } from '../lib/overview/locations-overview-columns'

function createLocationsOverviewQueryClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(sessionQueryKey, makeAuthMe(makeSessionUser()))
  client.setQueryData(campaignsQueryKey, [
    makeCampaignListItem({ id: STORY_CAMPAIGN_ID, campaignRole: 'owner' }),
  ])
  return client
}

const meta = {
  title: 'Content/Locations/LocationsOverview',
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={createLocationsOverviewQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('locations')}
      campaignId={STORY_CAMPAIGN_ID}
      isPending={false}
      isError={false}
      actions={<LocationCreateActions campaignId={STORY_CAMPAIGN_ID} />}
    >
      <DataTable
        columns={locationsColumns(STORY_CAMPAIGN_ID, { locations: [...LOCATIONS_LIST] })}
        data={[...LOCATIONS_LIST]}
        caption={formatContentCollectionAvailabilityCaption('locations')}
      />
    </ContentOverviewShell>
  ),
}
