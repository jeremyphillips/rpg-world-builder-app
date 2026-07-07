import type { Meta, StoryObj } from '@storybook/react-vite'

import { equipmentPickerBudgetFixture } from '../equipment/equipment-picker-drawer.fixtures'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'

const meta = {
  title: 'Character Builder/EquipmentBudgetHeader',
  component: EquipmentBudgetHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentBudgetHeader>

export default meta
type Story = StoryObj<typeof EquipmentBudgetHeader>

export const Default: Story = {
  args: {
    budget: equipmentPickerBudgetFixture,
  },
}
