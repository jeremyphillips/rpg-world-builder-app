import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import {
  EquipmentQuantityStepper,
  type EquipmentQuantityStepperProps,
} from './equipment-quantity-stepper'

function EquipmentQuantityStepperHarness({ value, ...props }: EquipmentQuantityStepperProps) {
  const [quantity, setQuantity] = useState(value)
  return <EquipmentQuantityStepper {...props} value={quantity} onChange={setQuantity} />
}

const meta = {
  title: 'Character Builder/EquipmentQuantityStepper',
  component: EquipmentQuantityStepper,
  parameters: { layout: 'centered' },
  render: (args) => <EquipmentQuantityStepperHarness {...args} />,
  args: {
    value: 1,
    min: 1,
    max: 9,
    size: 'sm',
    digits: 2,
    ariaLabel: 'Dagger quantity',
    onChange: () => undefined,
  },
} satisfies Meta<typeof EquipmentQuantityStepper>

export default meta
type Story = StoryObj<typeof meta>

/** Inventory row tier — the standalone control on an added equipment card. */
export const InventoryRow: Story = {}

/** Picker card header tier, inline in the trailing band cell. */
export const PickerCardHeader: Story = {
  args: { size: 'xs', digits: 1, additional: true, ariaLabel: 'Purchased quantity of Dagger' },
}

/** The `+` adornment reads the purchase as stacking on a package or grant quantity. */
export const StackedOnOtherSources: Story = {
  args: { additional: true, value: 2 },
}

/** At the minimum the decrement becomes a remove affordance. */
export const RemoveAtMinimum: Story = {
  args: {
    additional: true,
    remove: { ariaLabel: 'Remove purchased Dagger', onRemove: () => undefined },
  },
}

/** No handler wired — the whole control locks. */
export const Disabled: Story = {
  args: { disabled: true, value: 3 },
}
