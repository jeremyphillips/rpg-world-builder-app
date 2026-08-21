import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { buildLocationDetailViewModel } from '../../lib/location-display'
import { HARBORFORD, LOCATIONS_LIST, YAWNING_PORTAL } from '../../fixtures'
import { LocationChildrenSection } from './location-children-section.client'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

const harborfordChildren = buildLocationDetailViewModel(HARBORFORD, {
  locations: LOCATIONS_LIST,
  campaignId: STORY_CAMPAIGN_ID,
}).children

const emptyChildren = buildLocationDetailViewModel(YAWNING_PORTAL, {
  locations: LOCATIONS_LIST,
  campaignId: STORY_CAMPAIGN_ID,
}).children

const meta = {
  title: 'Content/Locations/LocationChildrenSection',
  component: LocationChildrenSection,
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof LocationChildrenSection>

export default meta

type Story = StoryObj<typeof LocationChildrenSection>

export const ContainedRows: Story = {
  args: {
    childrenViewModel: harborfordChildren,
    parentLocationId: HARBORFORD.id,
    parentKind: HARBORFORD.kind,
    campaignId: STORY_CAMPAIGN_ID,
    campaignLocations: LOCATIONS_LIST,
    canManage: false,
  },
}

export const ManagedWithMove: Story = {
  args: {
    childrenViewModel: harborfordChildren,
    parentLocationId: HARBORFORD.id,
    parentKind: HARBORFORD.kind,
    campaignId: STORY_CAMPAIGN_ID,
    campaignLocations: LOCATIONS_LIST,
    canManage: true,
  },
}

export const Empty: Story = {
  args: {
    childrenViewModel: emptyChildren,
    parentLocationId: YAWNING_PORTAL.id,
    parentKind: YAWNING_PORTAL.kind,
    campaignId: STORY_CAMPAIGN_ID,
    campaignLocations: LOCATIONS_LIST,
    canManage: true,
  },
}
