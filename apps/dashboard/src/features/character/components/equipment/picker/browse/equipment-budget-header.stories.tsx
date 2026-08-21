import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerLowRemainingBudgetFixture,
} from '../drawer/equipment-picker-drawer.fixtures'
import { EquipmentBudgetHeader } from './equipment-budget-header'

const meta = {
  title: 'Character Builder/EquipmentBudgetHeader',
  component: EquipmentBudgetHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentBudgetHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    budget: equipmentPickerBudgetFixture,
  },
}

export const LowRemaining: Story = {
  args: {
    budget: equipmentPickerLowRemainingBudgetFixture,
  },
}
