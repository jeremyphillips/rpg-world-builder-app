import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { HARBORFORD } from '../fixtures'
import { LocationContainedCreateDrawer } from './location-contained-create-drawer.client'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

const meta = {
  title: 'Content/Locations/LocationContainedCreateDrawer',
  component: LocationContainedCreateDrawer,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof LocationContainedCreateDrawer>

export default meta
type Story = StoryObj<typeof LocationContainedCreateDrawer>

export const AddBuilding: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    fixedCreate: {
      authoringType: 'building',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    },
    campaignId: STORY_CAMPAIGN_ID,
  },
}

export const AddDistrict: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    fixedCreate: {
      authoringType: 'district',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
    },
    campaignId: STORY_CAMPAIGN_ID,
  },
}

export const AddSettlement: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    fixedCreate: {
      authoringType: 'settlement',
      parent: { kind: 'fixed', locationId: HARBORFORD.id },
      settlementType: 'city',
    },
    campaignId: STORY_CAMPAIGN_ID,
  },
}
