import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import { EquipmentPickerDrawer } from './equipment-picker-drawer.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerLowRemainingBudgetFixture,
  equipmentPickerMagicItemsFixture,
  equipmentPickerRopeFixture,
} from './equipment-picker-drawer.fixtures'
import { EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL } from './equipment-picker-purchase.lib'

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

export const DefaultPathAffordableNow: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    filterOutUnaffordable: true,
    defaultTab: 'all',
    onAddItem: () => undefined,
  },
}

export const LowRemainingBudget: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    filterOutUnaffordable: false,
    defaultTab: 'all',
    onAddItem: () => undefined,
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

export const CharacterPreview: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    showCharacterPreview: true,
    characterPreviewContext: {
      level: 1,
      armorClassBase: DEFAULT_ARMOR_CLASS_BASE,
      abilityScores: { str: 16, dex: 14 },
      equippedArmor: [],
      budget: equipmentPickerBudgetFixture,
    },
    onAddItem: () => undefined,
  },
}

export const ClearFilters: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerItemsFixture,
    budget: equipmentPickerBudgetFixture,
    filterOutUnaffordable: false,
    defaultTab: 'all',
    toolbarResetMode: 'clear_filters',
    onAddItem: () => undefined,
  },
}

export const SortByPrice: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerDefaultPathItemsFixture,
    budget: equipmentPickerLowRemainingBudgetFixture,
    filterOutUnaffordable: false,
    defaultTab: 'all',
    onAddItem: () => undefined,
  },
}

export const OwnedStackable: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: [equipmentPickerItemsFixture[2]!],
    budget: equipmentPickerBudgetFixture,
    ownedPurchaseQuantities: { [equipmentPickerRopeFixture.id]: 2 },
    defaultTab: 'all',
    onAddItem: () => undefined,
  },
  parameters: {
    docs: {
      description: {
        story: `Owned stackables show ${EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL} in the header rail.`,
      },
    },
  },
}

export const MagicItemsWorkflow: Story = {
  args: {
    open: true,
    onOpenChange: () => undefined,
    items: equipmentPickerMagicItemsFixture,
    workflowMode: 'magic_items',
    workflowModes: ['purchase', 'magic_items'],
    onWorkflowModeChange: () => undefined,
    onAddItem: () => undefined,
  },
}
