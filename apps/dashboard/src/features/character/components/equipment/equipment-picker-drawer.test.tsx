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
} from './equipment-picker-drawer.fixtures'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL,
  EQUIPMENT_PICKER_RESET_VIEW_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_STARTING_OPTION_LABEL,
} from './equipment-picker-drawer.types'
import { EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL } from './equipment-picker-purchase.lib'

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
    expect(screen.getByText('1 hidden')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toHaveAccessibleName(/hidden/i)
  })

  it('clears search, category, and affordable filters together with clear_filters mode', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        defaultTab="all"
        toolbarResetMode="clear_filters"
        onAddItem={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))

    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }),
    ).toHaveTextContent(EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL)
    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }).textContent,
    ).not.toMatch(/\(\d+\)/)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }))

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('')
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeChecked()
    expect(
      screen.queryByRole('button', { name: EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toHaveTextContent(
      'Best match',
    )
    expect(screen.getByRole('tab', { selected: true, name: /All/i })).toBeInTheDocument()
  })

  it('resets sort, tab, search, and structured filters with reset_view mode', async () => {
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
    await user.click(screen.getByRole('combobox', { name: 'Equipment sort order' }))
    await user.click(screen.getByRole('option', { name: 'Price: Low to high' }))
    await user.click(screen.getByRole('tab', { name: /Recommended/i }))

    expect(
      screen.getByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL }))

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('')
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toHaveTextContent(
      'Best match',
    )
    expect(screen.getByRole('tab', { selected: true, name: /All/i })).toBeInTheDocument()
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
        defaultTab="all"
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

  it('preserves sort mode across tab switches', async () => {
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

    await user.click(screen.getByRole('combobox', { name: 'Equipment sort order' }))
    await user.click(screen.getByRole('option', { name: 'Name: Z–A' }))
    await user.click(screen.getByRole('tab', { name: /All/i }))

    expect(screen.getByRole('combobox', { name: 'Equipment sort order' })).toHaveTextContent(
      'Name: Z–A',
    )
  })

  it('renders reset view inline with the tab row', async () => {
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

    const tablist = screen.getByRole('tablist')
    await user.click(screen.getByRole('tab', { name: /Recommended/i }))

    const resetButton = screen.getByRole('button', { name: EQUIPMENT_PICKER_RESET_VIEW_LABEL })
    expect(tablist.parentElement?.parentElement).toContainElement(resetButton)
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
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
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
          recommendation: {
            tier: 'neutral' as const,
            reasons: [],
            specificity: 'broad_pool' as const,
          },
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
