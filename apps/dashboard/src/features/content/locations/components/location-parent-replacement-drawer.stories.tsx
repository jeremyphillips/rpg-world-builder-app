import type { Location } from '@rpg/contracts'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { ALDERMERE, LOCATIONS_LIST, YAWNING_PORTAL } from '../fixtures'
import { LocationParentReplacementDrawer } from './location-parent-replacement-drawer.client'

const PLANE: Location = {
  ...ALDERMERE,
  id: 'location-plane',
  slug: 'material-plane',
  name: 'Material Plane',
  kind: 'plane',
}

const meta = {
  title: 'Content/Locations/LocationParentReplacementDrawer',
  component: LocationParentReplacementDrawer,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LocationParentReplacementDrawer>

export default meta
type Story = StoryObj<typeof LocationParentReplacementDrawer>

export const ChangeParent: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    subject: YAWNING_PORTAL,
    campaignLocations: [...LOCATIONS_LIST, PLANE],
    onSubmit: async () => undefined,
  },
}

export const SetParent: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    subject: ALDERMERE,
    campaignLocations: [...LOCATIONS_LIST, PLANE],
    onSubmit: async () => undefined,
  },
}

export const MoveLocation: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    subject: YAWNING_PORTAL,
    campaignLocations: [...LOCATIONS_LIST, PLANE],
    surface: 'move',
    expectedParentLocationId: YAWNING_PORTAL.parentLocationId,
    onSubmit: async () => undefined,
  },
}
