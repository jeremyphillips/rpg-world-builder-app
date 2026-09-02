import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type WithCampaignAccess,
  type Location,
} from '@rpg/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { sessionQueryKey } from '@/features/auth'
import { campaignsQueryKey } from '@/features/campaign'
import { STORY_CAMPAIGN_ID } from '@/features/content/lib/fixtures/constants'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'

import { BulkChangeParentLocationDialog } from '../bulk-change-parent-location-dialog'
import { DOCK_WARD, GREYSHORE, HARBORFORD, LOCATIONS_LIST } from '../../../fixtures'

type StoryLocation = WithCampaignAccess<Location>

function withCampaignAccess(location: Location): StoryLocation {
  return {
    ...location,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }
}

const storyLocations = LOCATIONS_LIST.map(withCampaignAccess)

function createDialogQueryClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(sessionQueryKey, makeAuthMe(makeSessionUser()))
  client.setQueryData(campaignsQueryKey, [
    makeCampaignListItem({ id: STORY_CAMPAIGN_ID, campaignRole: 'owner' }),
  ])
  return client
}

const meta = {
  title: 'Content/Locations/BulkChangeParentLocationDialog',
  component: BulkChangeParentLocationDialog,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={createDialogQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  args: {
    open: true,
    onOpenChange: () => undefined,
    campaignId: STORY_CAMPAIGN_ID,
    campaignLocations: storyLocations,
    onApplyComplete: () => undefined,
  },
} satisfies Meta<typeof BulkChangeParentLocationDialog>

export default meta
type Story = StoryObj<typeof meta>

export const ConfigureSetParent: Story = {
  args: {
    selectedRows: [withCampaignAccess(HARBORFORD), withCampaignAccess(DOCK_WARD)],
  },
}

export const ConfigureClearParent: Story = {
  args: {
    selectedRows: [withCampaignAccess(GREYSHORE)],
  },
}

export const ConfigureAllUnchanged: Story = {
  args: {
    selectedRows: [withCampaignAccess(HARBORFORD)],
  },
  parameters: {
    docs: {
      description: {
        story:
          'When every selected location already uses the chosen parent, the summary reads "All N locations already use …" and no apply button is shown.',
      },
    },
  },
}

export const PartialBlockedSelection: Story = {
  args: {
    selectedRows: [
      withCampaignAccess(HARBORFORD),
      withCampaignAccess(DOCK_WARD),
      withCampaignAccess(GREYSHORE),
    ],
  },
}

export const AllBlockedSelection: Story = {
  args: {
    selectedRows: [withCampaignAccess(HARBORFORD)],
  },
}
