import type { Meta, StoryObj } from '@storybook/react-vite'

import { ResidenceLocationPickerDrawer } from './residence-location-picker-drawer'
import { residenceLocationPickerItems } from './residence-location-picker-drawer.fixtures'

const meta = {
  title: 'Character/ResidenceLocationPickerDrawer',
  component: ResidenceLocationPickerDrawer,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: residenceLocationPickerItems,
    onAdd: () => undefined,
  },
} satisfies Meta<typeof ResidenceLocationPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
