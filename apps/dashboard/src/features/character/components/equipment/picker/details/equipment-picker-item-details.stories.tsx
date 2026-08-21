import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'

import { EquipmentPickerItemDetails } from './equipment-picker-item-details.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
  equipmentPickerRopeFixture,
} from '../drawer/equipment-picker-drawer.fixtures'

const longswordItem = equipmentPickerItemsFixture[0]!

const meta = {
  title: 'Character Builder/EquipmentPickerItemDetails',
  component: EquipmentPickerItemDetails,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EquipmentPickerItemDetails>

export default meta
type Story = StoryObj<typeof meta>

export const WeaponExpanded: Story = {
  args: {
    equipment: longswordItem.equipment,
    itemState: longswordItem.state,
    budget: equipmentPickerBudgetFixture,
    ownedQuantity: 0,
    addQuantity: 1,
    onAddQuantityChange: () => undefined,
    onCommit: () => undefined,
    showCharacterPreview: true,
    characterPreviewContext: {
      level: 1,
      armorClassBase: DEFAULT_ARMOR_CLASS_BASE,
      abilityScores: { str: 16, dex: 14 },
      equippedArmor: [],
      budget: equipmentPickerBudgetFixture,
    },
  },
}

export const Owned: Story = {
  args: {
    ...WeaponExpanded.args,
    ownedQuantity: 1,
    showCharacterPreview: false,
    characterPreviewContext: undefined,
    onRemoveFromInventory: () => undefined,
  },
}

export const OwnedStackable: Story = {
  args: {
    equipment: equipmentPickerRopeFixture,
    itemState: equipmentPickerItemsFixture[2]!.state,
    budget: equipmentPickerBudgetFixture,
    ownedQuantity: 2,
    addQuantity: 1,
    onAddQuantityChange: () => undefined,
    onCommit: () => undefined,
    onRemoveFromInventory: () => undefined,
    onRemoveOneFromInventory: () => undefined,
    showCharacterPreview: false,
  },
}
