import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { EquipmentPickerDrawer } from './equipment-picker-drawer.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerItemsFixture,
} from './equipment-picker-drawer.fixtures'
import { EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL } from './equipment-picker-drawer.types'

describe('EquipmentPickerDrawer', () => {
  it('shows non-proficient warning badges and unaffordable disabled rows', () => {
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

    expect(screen.queryByText('Chain Mail')).not.toBeInTheDocument()
    expect(screen.getByText('Longsword')).toBeInTheDocument()
  })

  it('calls onAddItem with quantity 1 on repeat adds', async () => {
    const user = userEvent.setup()
    const onAddItem = vi.fn()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        onAddItem={onAddItem}
      />,
    )

    const addButton = screen.getAllByRole('button', { name: 'Add' })[0]!
    await user.click(addButton)
    await user.click(screen.getByRole('button', { name: 'Add another (2)' }))

    expect(onAddItem).toHaveBeenCalledTimes(2)
    expect(onAddItem).toHaveBeenNthCalledWith(1, equipmentPickerItemsFixture[0], 1)
    expect(onAddItem).toHaveBeenNthCalledWith(2, equipmentPickerItemsFixture[0], 1)
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
