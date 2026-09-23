import type { Meta, StoryObj } from '@storybook/react-vite'

import { PLACE_CONNECTION_ROLE_OPTIONS } from '../../../lib/relationship/connection-role-catalog'
import { LocationRelationshipAddDrawer } from './location-relationship-add-drawer'
import { harborfordSettlement } from './residence-location-picker-drawer.fixtures'

const meta = {
  title: 'Character Builder/Connections/LocationRelationshipAddDrawer',
  component: LocationRelationshipAddDrawer,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Add place',
    locations: [harborfordSettlement],
    roleOptions: PLACE_CONNECTION_ROLE_OPTIONS,
    onOpenChange: () => undefined,
    onAdd: () => undefined,
  },
} satisfies Meta<typeof LocationRelationshipAddDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ResidenceShortcut: Story = {
  args: {
    title: 'Add residence',
    presetRole: PLACE_CONNECTION_ROLE_OPTIONS.find((role) => role.kind === 'resides_at'),
  },
}

export const Empty: Story = {
  args: { locations: [] },
}
