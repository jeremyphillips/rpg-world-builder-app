import type { Meta, StoryObj } from '@storybook/react-vite'

import { EquipmentStartingPackageToolbar } from './equipment-starting-package-toolbar'

const meta = {
  title: 'Character Builder/EquipmentStartingPackageToolbar',
  component: EquipmentStartingPackageToolbar,
  args: {
    customizeDisabled: false,
    conversionEditorOpen: false,
    onCustomize: () => undefined,
    onChangeEquipmentOption: () => undefined,
  },
} satisfies Meta<typeof EquipmentStartingPackageToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomizeDisabled: Story = {
  args: {
    customizeDisabled: true,
  },
}

export const EditorOpen: Story = {
  args: {
    conversionEditorOpen: true,
    customizeControlsId: 'package-customize-editor',
  },
}
