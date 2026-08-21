import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { LocationRegionCreateSetup } from './location-region-create-setup'

const meta = {
  title: 'Content/Locations/LocationRegionCreateSetup',
  component: LocationRegionCreateSetup,
  args: {
    open: true,
    onOpenChange: fn(),
    onComplete: fn(),
    intent: { authoringType: 'region' },
  },
} satisfies Meta<typeof LocationRegionCreateSetup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SubregionUnderRegion: Story = {
  args: {
    intent: {
      authoringType: 'region',
      parentLocationId: 'location-greyshore',
      parentKind: 'region',
    },
  },
}
