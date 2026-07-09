import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { EquipmentPickerDrawer } from './equipment-picker-drawer.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
} from './equipment-picker-drawer.fixtures'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
} from './equipment-picker-drawer.types'
import { EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL } from './equipment-picker-purchase.lib'

describe('EquipmentPickerDrawer', () => {
  it('renders picker header titles and shows non-proficient warnings with disabled quick-add', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        defaultTab="all"
        onAddItem={vi.fn()}
      />,
    )

    expect(screen.getByText('Chain Mail · Armor')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)).toBeInTheDocument()
    expect(screen.getByText(/Need 75 GP, you have 40 GP/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('hides unaffordable rows by default', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        onAddItem={vi.fn()}
      />,
    )

    expect(screen.queryByText('Chain Mail · Armor')).not.toBeInTheDocument()
    expect(screen.getByText('Longsword · Weapon')).toBeInTheDocument()
  })

  it('quick-adds quantity 1 from the header rail', async () => {
    const user = userEvent.setup()
    const onAddItem = vi.fn()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[2]!]}
        budget={equipmentPickerBudgetFixture}
        onAddItem={onAddItem}
      />,
    )

    const ropeRow = equipmentPickerItemsFixture[2]!

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onAddItem).toHaveBeenCalledWith(ropeRow, 1)
  })

  it('commits purchase quantity from the expanded body', async () => {
    const user = userEvent.setup()
    const onAddItem = vi.fn()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[2]!]}
        budget={equipmentPickerBudgetFixture}
        onAddItem={onAddItem}
      />,
    )

    const ropeRow = equipmentPickerItemsFixture[2]!

    await user.click(screen.getByRole('button', { name: 'Expand Rope' }))
    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL }))

    expect(onAddItem).toHaveBeenCalledWith(ropeRow, 1)
  })

  it('shows Added in the header rail for owned items', () => {
    const longsword = equipmentPickerItemsFixture[0]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        ownedPurchaseQuantities={{ [longsword.equipment.id]: 1 }}
        onAddItem={vi.fn()}
      />,
    )

    expect(screen.getByText(EQUIPMENT_PICKER_ADDED_LABEL)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add' })).toHaveLength(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
