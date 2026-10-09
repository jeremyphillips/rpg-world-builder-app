import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'

import { EquipmentPickerItemDetails } from './equipment-picker-item-details'
import { EMPTY_EQUIPMENT_OWNERSHIP } from '../../../../lib/equipment/equipment-ownership-index.lib'
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
    ownership: EMPTY_EQUIPMENT_OWNERSHIP,
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

export const OwnedFromPackage: Story = {
  args: {
    ...WeaponExpanded.args,
    ownership: { ...EMPTY_EQUIPMENT_OWNERSHIP, packageQuantity: 1, totalQuantity: 1 },
    showCharacterPreview: false,
    characterPreviewContext: undefined,
  },
}

export const OwnedFromSeveralSources: Story = {
  args: {
    equipment: equipmentPickerRopeFixture,
    itemState: equipmentPickerItemsFixture[2]!.state,
    budget: equipmentPickerBudgetFixture,
    ownership: {
      ...EMPTY_EQUIPMENT_OWNERSHIP,
      packageQuantity: 1,
      lockedPurchased: { quantity: 1, spendCp: 100 },
      editablePurchased: { quantity: 2, spendCp: 200 },
      totalQuantity: 4,
      acquiredQuantity: 3,
    },
    showCharacterPreview: false,
  },
}
