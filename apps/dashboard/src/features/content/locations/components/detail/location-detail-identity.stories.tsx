import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildLocationDetailViewModel } from '../../lib/location-display'
import { ALDERMERE, HARBORFORD, LOCATIONS_LIST } from '../../fixtures'
import { LocationDetailIdentity } from './location-detail-identity.client'

const CAMPAIGN_ID = 'camp_story'

const meta = {
  title: 'Content/Locations/LocationDetailIdentity',
  component: LocationDetailIdentity,
} satisfies Meta<typeof LocationDetailIdentity>

export default meta

type Story = StoryObj<typeof LocationDetailIdentity>

export const Settlement: Story = {
  args: {
    identity: buildLocationDetailViewModel(HARBORFORD, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    }).identity,
  },
}

export const RootUncontained: Story = {
  args: {
    identity: buildLocationDetailViewModel(ALDERMERE, {
      locations: LOCATIONS_LIST,
      campaignId: CAMPAIGN_ID,
      canManage: true,
    }).identity,
  },
}
