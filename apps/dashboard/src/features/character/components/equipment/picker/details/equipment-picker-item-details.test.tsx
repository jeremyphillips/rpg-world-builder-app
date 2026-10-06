import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { EquipmentPickerItemDetails } from './equipment-picker-item-details'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
} from '../drawer/equipment-picker-drawer.fixtures'
import { equipmentPickerInventorySummaryPanelClasses } from './equipment-picker-inventory-summary.variants'
import { EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL } from './equipment-picker-character-preview.lib'
import { EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL } from './equipment-picker-inventory-summary'
import { EQUIPMENT_PICKER_INVENTORY_TOTAL_LABEL } from './equipment-picker-inventory-summary.lib'
import { EMPTY_EQUIPMENT_OWNERSHIP } from '../../../../lib/equipment/equipment-ownership-index.lib'

const ownedTwice = {
  ...EMPTY_EQUIPMENT_OWNERSHIP,
  packageQuantity: 1,
  editablePurchased: { quantity: 1, spendCp: 1500 },
  totalQuantity: 2,
  acquiredQuantity: 1,
}

describe('EquipmentPickerItemDetails', () => {
  const longswordItem = equipmentPickerItemsFixture[0]!

  it('renders metadata and character preview without an acquisition surface', () => {
    render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownership={EMPTY_EQUIPMENT_OWNERSHIP}
        showCharacterPreview
        characterPreviewContext={{
          level: 1,
          armorClassBase: DEFAULT_ARMOR_CLASS_BASE,
          abilityScores: { str: 16, dex: 14 },
          equippedArmor: [],
          budget: equipmentPickerBudgetFixture,
        }}
      />,
    )

    const headings = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent)
    expect(headings).toEqual([EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL])

    expect(screen.getByText(/Attack: \+5/)).toBeInTheDocument()
    expect(screen.queryByText(EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL)).toBeNull()
  })

  it('omits the inventory summary when nothing is owned', () => {
    render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownership={EMPTY_EQUIPMENT_OWNERSHIP}
      />,
    )

    expect(screen.queryByText(EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL)).toBeNull()
  })

  it('lists each ownership source and the total in a read-only panel', () => {
    render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownership={ownedTwice}
      />,
    )

    const panel = screen.getByRole('heading', {
      name: EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL,
    }).nextElementSibling

    expect(panel).toHaveClass(equipmentPickerInventorySummaryPanelClasses)
    expect(screen.getByText('Package')).toBeInTheDocument()
    expect(screen.getByText('×1 · 15 GP')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_INVENTORY_TOTAL_LABEL)).toBeInTheDocument()
    expect(screen.getByText('×2')).toBeInTheDocument()
    expect(panel!.querySelector('button')).toBeNull()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownership={ownedTwice}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
