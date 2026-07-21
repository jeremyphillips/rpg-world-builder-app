import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { EquipmentPickerDrawer } from './equipment-picker-drawer.client'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerLowRemainingBudgetFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
  pickerState,
} from './equipment-picker-drawer.fixtures'
import {
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_RESET_VIEW_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'
import {
  EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
  EQUIPMENT_PICKER_PURCHASE_REMOVE_ALL_LABEL,
  EQUIPMENT_PICKER_PURCHASE_REMOVE_ONE_LABEL,
} from './equipment-picker-purchase.lib'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('EquipmentPickerDrawer', () => {
  it('renders picker header titles and shows cannot-afford callout with disabled quick-add', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[1]!]}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Chain Mail')).toBeInTheDocument()
    expect(within(list).getByText('Armor')).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)).toBeInTheDocument()
    expect(within(list).getByText(/75 GP needed/i)).toBeInTheDocument()
    expect(within(list).getByText(/40 GP remaining/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('shows recommendation badges in the unified list', () => {
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
    expect(within(list).getByText('Rope')).toBeInTheDocument()
  })

  it('shows starting-unaffordable rows by default with purchase disabled', () => {
    const plateArmor: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[1]!,
      equipment: {
        ...equipmentPickerItemsFixture[1]!.equipment,
        id: 'srd-cc-5.2.1:plate-armor',
        slug: 'plate-armor',
        name: 'Plate Armor',
        cost: { amount: 1500, currency: 'gp' },
      },
      state: {
        ...equipmentPickerItemsFixture[1]!.state,
        isAffordable: false,
        isWithinRemainingBudget: false,
        isProficient: true,
      },
    }

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[plateArmor]}
        budget={equipmentPickerBudgetFixture}
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Plate Armor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('hides starting-unaffordable rows when filterOutUnaffordable is enabled', () => {
    const plateArmor: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[1]!,
      equipment: {
        ...equipmentPickerItemsFixture[1]!.equipment,
        id: 'srd-cc-5.2.1:plate-armor',
        slug: 'plate-armor',
        name: 'Plate Armor',
        cost: { amount: 1500, currency: 'gp' },
      },
      state: {
        ...equipmentPickerItemsFixture[1]!.state,
        isAffordable: false,
        isWithinRemainingBudget: false,
        isProficient: true,
      },
    }

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[plateArmor, equipmentPickerItemsFixture[2]!]}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).queryByText('Plate Armor')).not.toBeInTheDocument()
    expect(within(list).getByText('Rope')).toBeInTheDocument()
  })

  it('renders the Affordable now filter control when a budget is present', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).toBeInTheDocument()
  })

  it('does not render the Affordable now filter control without a budget', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('filters to affordable rows when Affordable now is checked', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable={false}
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

  it('clears search and category filters together with clear_filters mode', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        toolbarResetMode="clear_filters"
        onAddItem={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    await user.click(screen.getByRole('radio', { name: 'Weapon' }))
    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))

    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }),
    ).toHaveTextContent(EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL)
    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }).textContent,
    ).not.toMatch(/\(\d+\)/)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }))

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true')
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeChecked()
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toHaveTextContent(
      'Best match',
    )
  })

  it('keeps category selected when the active chip is clicked again', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    const weaponChip = screen.getByRole('radio', { name: 'Weapon' })
    await user.click(weaponChip)
    expect(weaponChip).toHaveAttribute('aria-checked', 'true')

    await user.click(weaponChip)
    expect(weaponChip).toHaveAttribute('aria-checked', 'true')
  })

  it('resets sort, search, and structured filters with reset_view mode', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    await user.click(screen.getByRole('radio', { name: 'Weapon' }))
    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))
    await user.click(screen.getByRole('combobox', { name: 'Equipment sort order' }))
    await user.click(screen.getByRole('option', { name: 'Price: Low to high' }))

    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL }))

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true')
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toHaveTextContent(
      'Best match',
    )
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL }),
    ).not.toBeInTheDocument()
  })

  it('reorders rows when sort is set to price ascending', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((row) => row.textContent),
    ).toEqual(expect.arrayContaining([expect.stringContaining('Cheap Gear')]))

    await user.click(screen.getByRole('combobox', { name: 'Equipment sort order' }))
    await user.click(screen.getByRole('option', { name: 'Price: Low to high' }))

    const names = within(list)
      .getAllByRole('listitem')
      .map((row) => row.textContent?.match(/^(Cheap Gear|Mid Gear|Expensive Gear)/)?.[0])
      .filter(Boolean)

    expect(names).toEqual(['Cheap Gear', 'Mid Gear', 'Expensive Gear'])
  })

  it('renders reset view when browse criteria drift from defaults', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')

    const resetButton = screen.getByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL })
    expect(resetButton).toBeInTheDocument()
    expect(resetButton).toHaveClass('[&_svg]:size-3')
  })

  it('shows the sort control with an accessible label', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        onAddItem={vi.fn()}
      />,
    )

    expect(screen.getByRole('group', { name: 'Sort equipment' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_SORT_LABEL)).toBeInTheDocument()
  })

  it('preserves browse sort across close and reopen', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onAddItem={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Equipment sort order' }))
    await user.click(screen.getByRole('option', { name: 'Name: Z–A' }))

    rerender(
      <EquipmentPickerDrawer
        open={false}
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
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
        onAddItem={vi.fn()}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toHaveTextContent('Z–A')
  })

  it('keeps added rows visible after quick-add', async () => {
    const user = userEvent.setup()
    const onAddItem = vi.fn()
    const cheapGear = equipmentPickerDefaultPathItemsFixture[0]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable={false}
        ownedPurchaseQuantities={{}}
        onAddItem={onAddItem}
      />,
    )

    const list = screen.getByRole('list')
    await user.click(within(list).getAllByRole('button', { name: 'Add' })[0]!)

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

  it('commits purchase quantity greater than one for stackable gear', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Increase Quantity to add for Rope' }))
    await user.click(screen.getByRole('button', { name: 'Increase Quantity to add for Rope' }))
    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL }))

    expect(onAddItem).toHaveBeenCalledWith(ropeRow, 3)
  })

  it('shows owned quantity badge and Add for owned stackables', async () => {
    const user = userEvent.setup()
    const onAddItem = vi.fn()
    const ropeRow = equipmentPickerItemsFixture[2]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[ropeRow]}
        budget={equipmentPickerBudgetFixture}
        ownedPurchaseQuantities={{ [ropeRow.equipment.id]: 2 }}
        onAddItem={onAddItem}
      />,
    )

    const addButton = screen.getByRole('button', { name: 'Add' })
    expect(addButton.parentElement).toHaveTextContent('2')
    await user.click(addButton)
    expect(onAddItem).toHaveBeenCalledWith(ropeRow, 1)
  })

  it('wires remove handlers from the expanded owned stackable body', async () => {
    const user = userEvent.setup()
    const onRemoveFromInventory = vi.fn()
    const onRemoveOneFromInventory = vi.fn()
    const ropeRow = equipmentPickerItemsFixture[2]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[ropeRow]}
        budget={equipmentPickerBudgetFixture}
        ownedPurchaseQuantities={{ [ropeRow.equipment.id]: 2 }}
        onAddItem={vi.fn()}
        onRemoveFromInventory={onRemoveFromInventory}
        onRemoveOneFromInventory={onRemoveOneFromInventory}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Expand Rope' }))
    await user.click(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_REMOVE_ONE_LABEL }),
    )
    await user.click(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_REMOVE_ALL_LABEL }),
    )

    expect(onRemoveOneFromInventory).toHaveBeenCalledWith(ropeRow)
    expect(onRemoveFromInventory).toHaveBeenCalledWith(ropeRow)
  })

  it('shows owned quantity badge and Add for owned items while stack rules are permissive', () => {
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

    const list = screen.getByRole('list')
    const longswordRow = within(list)
      .getByText('Longsword')
      .closest('[role="listitem"]') as HTMLElement
    const addButton = within(longswordRow).getByRole('button', { name: 'Add' })
    expect(addButton.parentElement).toHaveTextContent('1')
    expect(addButton).toBeInTheDocument()
  })

  it('excludes vehicle and service rows from search results and category filter', () => {
    const unsupportedItems = [
      {
        equipment: equipmentPickerRowboatFixture,
        searchText: 'rowboat water vehicle',
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
          disabledReasons: [],
        }),
      },
      {
        equipment: equipmentPickerSkilledHirelingFixture,
        searchText: 'skilled hireling service',
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
          isAffordable: true,
          isWithinRemainingBudget: true,
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
          disabledReasons: [],
        }),
      },
    ]

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[...equipmentPickerItemsFixture, ...unsupportedItems]}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
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
