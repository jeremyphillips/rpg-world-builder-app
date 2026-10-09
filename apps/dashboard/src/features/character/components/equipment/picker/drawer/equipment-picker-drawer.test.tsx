import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentPickerDrawer } from './equipment-picker-drawer'
import {
  equipmentPickerBudgetFixture,
  equipmentPickerDefaultPathItemsFixture,
  equipmentPickerItemsFixture,
  equipmentPickerLowRemainingBudgetFixture,
  equipmentPickerMagicItemAllowancesFixture,
  equipmentPickerMagicItemProgressFixture,
  equipmentPickerMagicItemsFixture,
  equipmentPickerRowboatFixture,
  equipmentPickerSkilledHirelingFixture,
  pickerState,
} from './equipment-picker-drawer.fixtures'
import { CATALOG_TOOLBAR_RESET_WITH_SORT_NAME } from '../../../picker/catalog-toolbar-reset-action'
import {
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_SORT_GROUP_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_SORT_ORDER_LABEL,
  type EquipmentPickerRow,
} from './equipment-picker-drawer.types'
import {
  OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  requiredByLabel,
} from '@rpg/contracts'
import {
  builderPathGoldBudgetFixture,
  wizardGoldPathPickerItemsFixture,
} from './equipment-picker-builder-path.fixtures'
import {
  EMPTY_EQUIPMENT_OWNERSHIP,
  type EquipmentPickerOwnershipIndex,
} from '../../../../lib/equipment/equipment-ownership-index.lib'

function ownershipWithPurchase(
  equipmentId: string,
  quantity: number,
): EquipmentPickerOwnershipIndex {
  return new Map([
    [
      equipmentId,
      {
        ...EMPTY_EQUIPMENT_OWNERSHIP,
        editablePurchased: { quantity, spendCp: 0 },
        totalQuantity: quantity,
        acquiredQuantity: quantity,
      },
    ],
  ])
}

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
  it('renders picker header titles and shows cannot-afford callout with disabled quick-add', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[1]!]}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Chain Mail')).toBeInTheDocument()
    expect(within(list).getByText('Armor')).toBeInTheDocument()
    const cannotAffordBadge = screen.getByText(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)
    expect(cannotAffordBadge).toBeInTheDocument()
    expect(within(list).queryByText(/75 GP needed/i)).not.toBeInTheDocument()
    expect(within(list).queryByText(/40 GP remaining/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.getByText('100 GP budget · 15 GP spent')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Browse equipment' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await user.hover(cannotAffordBadge)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('75 GP needed')
    expect(screen.getByRole('tooltip')).toHaveTextContent('40 GP remaining')
  })

  it('shows recommendation badges in the unified list', () => {
    const [longsword, ...rest] = equipmentPickerItemsFixture
    const longswordWithRecommendation = {
      ...longsword!,
      state: {
        ...longsword!.state,
        resolved: {
          ...longsword!.state.resolved!,
          presentation: {
            facts: [
              {
                kind: 'recommendation' as const,
                discriminator: 'recommended' as const,
                label: OPTION_PRESENTATION_RECOMMENDED_LABEL,
                sourceLabels: ['Fighter class'],
              },
            ],
          },
        },
      },
    }

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[longswordWithRecommendation, ...rest]}
        budget={equipmentPickerBudgetFixture}
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Longsword')).toBeInTheDocument()
    expect(within(list).getByText(OPTION_PRESENTATION_RECOMMENDED_LABEL)).toBeInTheDocument()
    expect(within(list).getByText('Rope')).toBeInTheDocument()
  })

  it('shows starting-unaffordable rows by default with purchase disabled', () => {
    const plateArmor: EquipmentPickerRow = {
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
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).getByText('Plate Armor')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('hides starting-unaffordable rows when filterOutUnaffordable is enabled', () => {
    const plateArmor: EquipmentPickerRow = {
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
        onCommitAdd={vi.fn()}
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
        onCommitAdd={vi.fn()}
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
        onCommitAdd={vi.fn()}
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
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')
    expect(within(list).getByText('Cheap Gear')).toBeInTheDocument()
    expect(within(list).getByText('Mid Gear')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))

    expect(within(list).getByText('Cheap Gear')).toBeInTheDocument()
    expect(within(list).queryByText('Mid Gear')).not.toBeInTheDocument()
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
        onCommitAdd={vi.fn()}
      />,
    )

    const weaponChip = screen.getByRole('radio', { name: 'Weapons' })
    await user.click(weaponChip)
    expect(weaponChip).toHaveAttribute('aria-checked', 'true')

    await user.click(weaponChip)
    expect(weaponChip).toHaveAttribute('aria-checked', 'true')
  })

  it('resets sort, search, and structured filters', async () => {
    const user = userEvent.setup()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onCommitAdd={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')
    await user.click(screen.getByRole('radio', { name: 'Weapons' }))
    await user.click(screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }))
    await user.click(screen.getByRole('combobox', { name: EQUIPMENT_PICKER_SORT_ORDER_LABEL }))
    await user.click(screen.getByRole('option', { name: 'Price: Low to high' }))

    expect(
      screen.getByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME }))

    expect(screen.getByRole('textbox', { name: 'Search catalog' })).toHaveValue('')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true')
    expect(
      screen.getByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeChecked()
    expect(
      screen.getByRole('combobox', { name: EQUIPMENT_PICKER_SORT_ORDER_LABEL }),
    ).toHaveTextContent('Best match')
    expect(
      screen.queryByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME }),
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
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')
    expect(
      within(list)
        .getAllByRole('listitem')
        .map((row) => row.textContent),
    ).toEqual(expect.arrayContaining([expect.stringContaining('Cheap Gear')]))

    await user.click(screen.getByRole('combobox', { name: EQUIPMENT_PICKER_SORT_ORDER_LABEL }))
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
        onCommitAdd={vi.fn()}
      />,
    )

    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rope')

    const resetButton = screen.getByRole('button', { name: CATALOG_TOOLBAR_RESET_WITH_SORT_NAME })
    expect(resetButton).toHaveTextContent('Reset')
    expect(resetButton).toHaveClass('h-6')
    expect(resetButton.querySelector('svg')).toHaveClass('size-icon-glyph-sm')
  })

  it('shows the sort control with an accessible label', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        onCommitAdd={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('group', { name: EQUIPMENT_PICKER_SORT_GROUP_LABEL }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: EQUIPMENT_PICKER_SORT_ORDER_LABEL }),
    ).toBeInTheDocument()
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
        onCommitAdd={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: EQUIPMENT_PICKER_SORT_ORDER_LABEL }))
    await user.click(screen.getByRole('option', { name: 'Name: Z–A' }))

    rerender(
      <EquipmentPickerDrawer
        open={false}
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onCommitAdd={vi.fn()}
      />,
    )

    rerender(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onCommitAdd={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('combobox', { name: EQUIPMENT_PICKER_SORT_ORDER_LABEL }),
    ).toHaveTextContent('Z–A')
  })

  it('keeps added rows visible after quick-add', async () => {
    const user = userEvent.setup()
    const onCommitAdd = vi.fn()
    const cheapGear = equipmentPickerDefaultPathItemsFixture[0]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerDefaultPathItemsFixture}
        budget={equipmentPickerLowRemainingBudgetFixture}
        filterOutUnaffordable={false}
        onCommitAdd={onCommitAdd}
      />,
    )

    const list = screen.getByRole('list')
    await user.click(within(list).getAllByRole('button', { name: 'Add' })[0]!)

    expect(onCommitAdd).toHaveBeenCalledWith(cheapGear)
    expect(screen.getByText('Cheap Gear')).toBeInTheDocument()
    expect(within(list).getAllByRole('button', { name: 'Add' }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Added/)).not.toBeInTheDocument()
  })

  it('quick-adds quantity 1 from the header rail', async () => {
    const user = userEvent.setup()
    const onCommitAdd = vi.fn()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[equipmentPickerItemsFixture[2]!]}
        budget={equipmentPickerBudgetFixture}
        onCommitAdd={onCommitAdd}
      />,
    )

    const ropeRow = equipmentPickerItemsFixture[2]!

    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(onCommitAdd).toHaveBeenCalledWith(ropeRow)
  })

  it('swaps Add for the aggregate stepper once the item is purchased', async () => {
    const user = userEvent.setup()
    const onSetPurchasedQuantity = vi.fn()
    const ropeRow = equipmentPickerItemsFixture[2]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[ropeRow]}
        budget={equipmentPickerBudgetFixture}
        ownership={ownershipWithPurchase(ropeRow.equipment.id, 2)}
        onCommitAdd={vi.fn()}
        onSetPurchasedQuantity={onSetPurchasedQuantity}
      />,
    )

    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull()
    const stepper = screen.getByRole('spinbutton', { name: 'Purchased quantity of Rope' })
    expect(stepper).toHaveValue(2)

    await user.click(screen.getByRole('button', { name: 'Increase Purchased quantity of Rope' }))
    expect(onSetPurchasedQuantity).toHaveBeenCalledWith(ropeRow, 3)
  })

  it('drops the aggregate to zero from the stepper remove affordance', async () => {
    const user = userEvent.setup()
    const onSetPurchasedQuantity = vi.fn()
    const ropeRow = equipmentPickerItemsFixture[2]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[ropeRow]}
        budget={equipmentPickerBudgetFixture}
        ownership={ownershipWithPurchase(ropeRow.equipment.id, 1)}
        onCommitAdd={vi.fn()}
        onSetPurchasedQuantity={onSetPurchasedQuantity}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove purchased Rope' }))
    expect(onSetPurchasedQuantity).toHaveBeenCalledWith(ropeRow, 0)
  })

  it('lists owned provenance on the row instead of an owned-count badge', () => {
    const longsword = equipmentPickerItemsFixture[0]!

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        ownership={
          new Map([
            [
              longsword.equipment.id,
              { ...EMPTY_EQUIPMENT_OWNERSHIP, packageQuantity: 1, totalQuantity: 1 },
            ],
          ])
        }
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')
    const longswordRow = within(list)
      .getByText('Longsword')
      .closest('[role="listitem"]') as HTMLElement

    expect(within(longswordRow).getByText('Owned')).toBeInTheDocument()
    expect(within(longswordRow).getAllByText('Package')).toHaveLength(1)
    expect(within(longswordRow).getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(within(longswordRow).queryByText(/Added/)).not.toBeInTheDocument()
  })

  it('excludes vehicle and service rows from search results and category filter', () => {
    const unsupportedItems = [
      {
        equipment: equipmentPickerRowboatFixture,
        searchDocument: {
          id: equipmentPickerRowboatFixture.id,
          fields: [{ key: 'combined', text: 'rowboat water vehicle', role: 'primary' as const }],
        },
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
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
        searchDocument: {
          id: equipmentPickerSkilledHirelingFixture.id,
          fields: [{ key: 'combined', text: 'skilled hireling service', role: 'primary' as const }],
        },
        state: pickerState({
          isAvailable: true,
          isRecommended: false,
          isProficient: true,
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
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')

    expect(within(list).queryByText('Rowboat')).not.toBeInTheDocument()
    expect(within(list).queryByText('Skilled Hireling')).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Vehicle' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Service' })).not.toBeInTheDocument()
  })

  it('renders rarity chips in magic-items workflow when multiple allowances exist', async () => {
    const user = userEvent.setup()
    const onFocusedAllowanceIdChange = vi.fn()

    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerMagicItemsFixture}
        workflowMode="magic_items"
        magicItemGrantProgress={equipmentPickerMagicItemProgressFixture}
        onFocusedAllowanceIdChange={onFocusedAllowanceIdChange}
        onCommitAdd={vi.fn()}
      />,
    )

    const list = screen.getByRole('list')
    expect(
      within(list).getByText(equipmentPickerMagicItemsFixture[0]!.equipment.name),
    ).toBeInTheDocument()
    expect(within(list).queryByText('Magic Item')).not.toBeInTheDocument()

    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Common' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Uncommon' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Uncommon' }))

    expect(onFocusedAllowanceIdChange).toHaveBeenCalledWith(
      equipmentPickerMagicItemProgressFixture[1]!.allowanceId,
    )
  })

  it('shows a magic-item summary without a workflow segment when purchase is unavailable', () => {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerMagicItemsFixture}
        workflowMode="magic_items"
        workflowModes={['magic_items']}
        magicItemAllowances={equipmentPickerMagicItemAllowancesFixture}
        magicItemGrantProgress={equipmentPickerMagicItemProgressFixture}
        onCommitAdd={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Magic items' })).toBeInTheDocument()
    expect(screen.getByLabelText('Up to Uncommon · 1 available')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Purchase' })).not.toBeInTheDocument()
  })

  it('swaps the resource summary when the dual-workflow segment changes mode', async () => {
    const user = userEvent.setup()

    function DualWorkflowDrawer() {
      const [workflowMode, setWorkflowMode] = useState<EquipmentPickerWorkflowMode>('purchase')

      return (
        <EquipmentPickerDrawer
          open
          onOpenChange={vi.fn()}
          items={equipmentPickerItemsFixture}
          budget={workflowMode === 'purchase' ? equipmentPickerBudgetFixture : undefined}
          workflowMode={workflowMode}
          workflowModes={['purchase', 'magic_items']}
          onWorkflowModeChange={setWorkflowMode}
          magicItemAllowances={equipmentPickerMagicItemAllowancesFixture}
          magicItemGrantProgress={equipmentPickerMagicItemProgressFixture}
          onCommitAdd={vi.fn()}
        />
      )
    }

    render(<DualWorkflowDrawer />)

    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Magic items' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Purchase' }).querySelector('svg')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Magic items' }).querySelector('svg')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Magic items' }))

    expect(screen.queryByRole('heading', { name: '40 GP remaining' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Magic items' })).toBeInTheDocument()
    expect(screen.getByLabelText('Up to Uncommon · 1 available')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Purchase' }))

    expect(screen.getByRole('heading', { name: '40 GP remaining' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Magic items' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Up to Uncommon · 1 available')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={equipmentPickerItemsFixture}
        budget={equipmentPickerBudgetFixture}
        filterOutUnaffordable={false}
        onCommitAdd={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})

describe('EquipmentPickerDrawer selection-row status line', () => {
  function renderWizardGoldPath() {
    render(
      <EquipmentPickerDrawer
        open
        onOpenChange={vi.fn()}
        items={[
          wizardGoldPathPickerItemsFixture.spellbook,
          wizardGoldPathPickerItemsFixture['plate-armor'],
        ]}
        budget={builderPathGoldBudgetFixture}
        filterOutUnaffordable={false}
        isGoldShoppingPath
        onCommitAdd={vi.fn()}
      />,
    )
    return screen.getByRole('list')
  }

  function rowFor(list: HTMLElement, name: string): HTMLElement {
    const row = within(list).getByText(name).closest<HTMLElement>('[role="listitem"]')
    if (!row) throw new Error(`missing row ${name}`)
    return row
  }

  it('renders blockers before requirement and source guidance', () => {
    const spellbook = rowFor(renderWizardGoldPath(), 'Spellbook')
    const text = spellbook.textContent ?? ''

    const order = [
      EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
      requiredByLabel('class'),
      OPTION_PRESENTATION_INCLUDED_IN_PACKAGE_OPTION_LABEL,
    ].map((label) => text.indexOf(label))
    expect(order.every((index) => index >= 0)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(within(spellbook).getByText(requiredByLabel('class'))).toHaveAttribute(
      'title',
      'Wizard class',
    )
  })

  it('shows compatibility warnings as badges with the requirement detail as title', () => {
    const plate = rowFor(renderWizardGoldPath(), 'Plate Armor')

    expect(within(plate).getByText(EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)).toBeInTheDocument()
    expect(within(plate).getByText('Not proficient')).toBeInTheDocument()
    expect(within(plate).getByText('Requires STR 15')).toHaveAttribute(
      'title',
      'Requires STR 15; character has STR 8.',
    )
  })
})
