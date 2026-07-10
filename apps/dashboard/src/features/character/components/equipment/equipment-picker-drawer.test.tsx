import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { EquipmentPickerDrawer } from './equipment-picker-drawer.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerLowRemainingBudgetFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
} from './equipment-picker-drawer.fixtures'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
} from './equipment-picker-drawer.types'
import { EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL } from './equipment-picker-purchase.lib'

describe('EquipmentPickerDrawer', () => {
  it('renders picker header titles and shows non-proficient warnings with disabled quick-add', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[1]!]}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        defaultTab="all"
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Chain Mail')).toBeInTheDocument()
    expect(within(list).getByText('Armor')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)).toBeInTheDocument()
    expect(within(list).getByText(/75 GP needed/i)).toBeInTheDocument()
    expect(within(list).getByText(/40 GP remaining/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('shows recommendation badges on the recommended tab', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Longsword')).toBeInTheDocument()
    expect(within(list).getByText(EQUIPMENT_PICKER_STARTING_OPTION_LABEL)).toBeInTheDocument()
    expect(within(list).queryByText('Rope')).not.toBeInTheDocument()
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

    const list = screen.getByRole('list')

    expect(within(list).queryByText('Chain Mail')).not.toBeInTheDocument()
    expect(within(list).getByText('Longsword')).toBeInTheDocument()
    expect(within(list).getByText('Weapon')).toBeInTheDocument()
  })

  it('filters to affordable rows when Affordable now is checked', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable
        defaultTab="all"
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')
    expect(within(list).getByText('Cheap Gear')).toBeInTheDocument()
    expect(within(list).getByText('Mid Gear')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))

    expect(within(list).getByText('Cheap Gear')).toBeInTheDocument()
    expect(within(list).queryByText('Mid Gear')).not.toBeInTheDocument()
  })

  it('clears search, category, and affordable filters together', async () => {
    const user = userEvent.setup()

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

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))

    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }))

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('')
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeChecked()
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('preserves browse filters across close and reopen', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
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

    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))

    rerender(
      <EquipmentPickerDrawer
        open={false}
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        defaultTab="all"
        onAddItem={vi.fn()}
      />,
    )

    rerender(
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

    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).toBeChecked()
  })

  it('keeps added rows visible after quick-add while affordable filter is on', async () => {
    const user = userEvent.setup()
    const onAddItem = vi.fn()
    const cheapGear = equipmentPickerDefaultPathItemsFixture[0]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable
        defaultTab="all"
        ownedPurchaseQuantities={{}}
        onAddItem={onAddItem}
      />,
    )

    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(onAddItem).toHaveBeenCalledWith(cheapGear, 1)
    expect(screen.getByText('Cheap Gear')).toBeInTheDocument()
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
        defaultTab="all"
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
        defaultTab="all"
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
    expect(screen.queryAllByRole('button', { name: 'Add' })).toHaveLength(0)
  })

  it('excludes vehicle and service rows from search results and category filter', () => {
    const unsupportedItems = [
      {
        equipment: equipmentPickerRowboatFixture,
        searchText: 'rowboat water vehicle',
        state: {
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          recommendation: { tier: 'neutral' as const, reasons: [] },
          disabledReasons: [],
        },
      },
      {
        equipment: equipmentPickerSkilledHirelingFixture,
        searchText: 'skilled hireling service',
        state: {
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          recommendation: { tier: 'neutral' as const, reasons: [] },
          disabledReasons: [],
        },
      },
    ]

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[...equipmentPickerItemsFixture, ...unsupportedItems]}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        defaultTab="all"
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).queryByText('Rowboat')).not.toBeInTheDocument()
    expect(within(list).queryByText('Skilled Hireling')).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Vehicle' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Service' })).not.toBeInTheDocument()
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
