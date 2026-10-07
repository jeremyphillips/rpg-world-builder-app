import type { Meta, StoryObj } from '@storybook/react-vite'

import { EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL } from '../drawer/equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_ADD_LABEL,
  EquipmentPickerRowAcquisitionControl,
} from './equipment-picker-row-acquisition-control'

const meta = {
  title: 'Character Builder/EquipmentPickerRowAcquisitionControl',
  component: EquipmentPickerRowAcquisitionControl,
  parameters: { layout: 'centered' },
  args: {
    equipmentName: 'Rope',
    addLabel: EQUIPMENT_PICKER_ADD_LABEL,
    onAdd: () => undefined,
    onSetPurchasedQuantity: () => undefined,
    onRelease: () => undefined,
    onRemovePurchase: () => undefined,
  },
} satisfies Meta<typeof EquipmentPickerRowAcquisitionControl>

export default meta
type Story = StoryObj<typeof meta>

export const Add: Story = {
  args: { control: { kind: 'add', disabled: false } },
}

export const AddBlocked: Story = {
  args: { control: { kind: 'add', disabled: true } },
}

export const NotForSale: Story = {
  args: { control: { kind: 'disabled', label: EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL } },
}

export const NoChoices: Story = {
  args: {
    control: {
      kind: 'disabled',
      label: 'No common choices',
      tooltip: 'Common choices are already used.',
    },
  },
}

export const AddFailed: Story = {
  args: { control: { kind: 'add', disabled: false }, commitFailed: true },
}

export const PurchasedAggregate: Story = {
  args: { control: { kind: 'stepper', value: 2, max: 5 } },
}

export const PurchasedAtFloor: Story = {
  args: { control: { kind: 'stepper', value: 1, max: 5 } },
}

export const PurchasedAtCeiling: Story = {
  args: { control: { kind: 'stepper', value: 3, max: 3 } },
}

export const ReleaseChoice: Story = {
  args: { control: { kind: 'release', allowanceId: 'allowance-1' } },
}

export const RemovePurchase: Story = {
  args: { control: { kind: 'remove', purchaseId: 'purchase-1' } },
}
