import type { Meta, StoryObj } from '@storybook/react-vite'

import { OrganizationPickerDrawer } from './organization-picker-drawer.client'
import { organizationPickerItems } from './organization-picker-drawer.fixtures'

const meta = {
  title: 'Character Builder/Connections/OrganizationPickerDrawer',
  component: OrganizationPickerDrawer,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: organizationPickerItems,
    onAdd: () => undefined,
  },
} satisfies Meta<typeof OrganizationPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { items: [] },
}
