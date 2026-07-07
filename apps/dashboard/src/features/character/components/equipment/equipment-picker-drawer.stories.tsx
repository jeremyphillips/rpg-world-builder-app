import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@rpg/ui'

import { EquipmentPickerDrawer } from './equipment-picker-drawer.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
} from './equipment-picker-drawer.fixtures'

const meta = {
  title: 'Character Builder/EquipmentPickerDrawer',
  component: EquipmentPickerDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof EquipmentPickerDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    onAddItem: () => undefined,
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)

    return (
      <>
        <Button className="m-8" onClick={() => setOpen(true)}>
          Open equipment picker
        </Button>
        <EquipmentPickerDrawer {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
}

export const HideUnaffordable: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: true,
    onAddItem: () => undefined,
  },
}

export const HideNonProficient: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    filterOutNonProficient: true,
    onAddItem: () => undefined,
  },
}
