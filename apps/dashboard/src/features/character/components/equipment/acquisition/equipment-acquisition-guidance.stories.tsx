import type { Meta, StoryObj } from '@storybook/react-vite'

import type { MagicItemGrantProgress } from '@rpg/contracts'

import { equipmentPickerBudgetFixture } from '../picker/equipment-picker-drawer.fixtures'
import { EquipmentAcquisitionGuidance } from './equipment-acquisition-guidance.client'

const magicItemProgress: MagicItemGrantProgress[] = [
  {
    allowanceId: 'allowance-common',
    rarity: 'common',
    capacity: 2,
    selected: 2,
    remainingCapacity: 0,
    isFilled: true,
  },
  {
    allowanceId: 'allowance-uncommon',
    rarity: 'uncommon',
    capacity: 1,
    selected: 0,
    remainingCapacity: 1,
    isFilled: false,
  },
]

const meta = {
  title: 'Character Builder/EquipmentAcquisitionGuidance',
  component: EquipmentAcquisitionGuidance,
  parameters: { layout: 'padded' },
  args: {
    showPurchaseWorkflow: true,
    budget: equipmentPickerBudgetFixture,
    onOpenPurchasePicker: () => undefined,
    showMagicItemGrants: true,
    magicItemProgress,
    onOpenMagicItemsPicker: () => undefined,
  },
} satisfies Meta<typeof EquipmentAcquisitionGuidance>

export default meta
type Story = StoryObj<typeof meta>

export const DualWorkflow: Story = {}

export const PurchaseOnly: Story = {
  args: {
    showMagicItemGrants: false,
    magicItemProgress: [],
  },
}

export const MagicItemsOnly: Story = {
  args: {
    showPurchaseWorkflow: false,
    budget: undefined,
  },
}
