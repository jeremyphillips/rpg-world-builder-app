import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { DEFAULT_ARMOR_CLASS_BASE } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'

import { EquipmentPickerItemDetails } from './equipment-picker-item-details.client'
import {
  equipmentPickerArrowsFixture,
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
  equipmentPickerRopeFixture,
} from './equipment-picker-drawer.fixtures'
import {
  EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL,
  EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
  EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
} from './equipment-picker-purchase.lib'
import { EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL } from './equipment-picker-character-preview.lib'

describe('EquipmentPickerItemDetails', () => {
  const longswordItem = equipmentPickerItemsFixture[0]!

  it('renders metadata, character preview, and purchase sections in order', () => {
    render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownedQuantity={0}
        addQuantity={1}
        onAddQuantityChange={vi.fn()}
        onCommit={vi.fn()}
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
    expect(headings).toEqual([
      EQUIPMENT_PICKER_CHARACTER_PREVIEW_SECTION_LABEL,
      EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
    ])

    expect(screen.getByText(/Attack: \+5/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Remaining after purchase/)).toBeInTheDocument()
  })

  it('shows an owned note instead of purchase controls when a unique item is already owned', () => {
    render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownedQuantity={1}
        addQuantity={1}
        onAddQuantityChange={vi.fn()}
        onCommit={vi.fn()}
      />,
    )

    expect(screen.getByText(/Already in equipment: 1/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('shows bundle copy for bundled adventuring gear purchases', () => {
    const arrowsItem = {
      equipment: equipmentPickerArrowsFixture,
      searchText: 'arrows ammunition',
      state: equipmentPickerItemsFixture[2]!.state,
    }

    render(
      <EquipmentPickerItemDetails
        equipment={arrowsItem.equipment}
        itemState={arrowsItem.state}
        budget={equipmentPickerBudgetFixture}
        ownedQuantity={0}
        addQuantity={2}
        onAddQuantityChange={vi.fn()}
        onCommit={vi.fn()}
      />,
    )

    expect(screen.getByText('20 arrows per bundle')).toBeInTheDocument()
  })

  it('shows Add another for owned stackable items', async () => {
    const user = userEvent.setup()
    const onAddAnother = vi.fn()
    const ropeItem = equipmentPickerItemsFixture[2]!

    render(
      <EquipmentPickerItemDetails
        equipment={equipmentPickerRopeFixture}
        itemState={ropeItem.state}
        budget={equipmentPickerBudgetFixture}
        ownedQuantity={2}
        addQuantity={1}
        onAddQuantityChange={vi.fn()}
        onCommit={vi.fn()}
        onAddAnother={onAddAnother}
      />,
    )

    expect(screen.getByText(/Already in equipment: 2/)).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL }),
    )
    expect(onAddAnother).toHaveBeenCalledTimes(1)
  })

  it('commits purchase from the body CTA', async () => {
    const user = userEvent.setup()
    const onCommit = vi.fn()

    render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownedQuantity={0}
        addQuantity={1}
        onAddQuantityChange={vi.fn()}
        onCommit={onCommit}
      />,
    )

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL }))
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentPickerItemDetails
        equipment={longswordItem.equipment}
        itemState={longswordItem.state}
        budget={equipmentPickerBudgetFixture}
        ownedQuantity={0}
        addQuantity={1}
        onAddQuantityChange={vi.fn()}
        onCommit={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
