import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { equipmentStepBardClassFixture } from '../../../../lib/equipment/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentInventoryRowItem } from '../row/equipment-inventory-row'

const editableStackableRow: EquipmentInventoryRow = {
  group: 'gear',
  groupLabel: 'Gear',
  entry: {
    equipmentId: 'srd-cc-5.2.1:rations',
    quantity: 2,
    sources: [{ kind: 'startingGold' }],
  },
  equipmentName: 'Rations',
  sourceLabel: 'Purchased with starting gold',
  isStackable: true,
  quantityMode: 'editable',
  maxQuantity: 20,
  priceLineLabel: '5 SP each · 1 GP total',
  removeLabel: 'Remove all 2 Rations',
  removeTarget: { kind: 'purchase', purchaseId: 'purchase-row-test-0' },
  quantityTarget: { kind: 'purchase', purchaseId: 'purchase-row-test-0' },
}

describe('EquipmentInventoryRowItem', () => {
  it('renders the parent-resolved status as one metadata line', () => {
    render(
      <EquipmentInventoryRowItem
        display={{ kind: 'single', row: editableStackableRow }}
        status={[
          { kind: 'badge', label: 'Not proficient', tone: 'warning' },
          { kind: 'badge', label: 'Requires STR 15', tone: 'warning' },
        ]}
      />,
    )

    expect(screen.getByText('Not proficient')).toBeInTheDocument()
    expect(screen.getByText('Requires STR 15')).toBeInTheDocument()
  })

  it('renders stepper and remove inline with the title for editable stackables', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()

    render(
      <EquipmentInventoryRowItem
        display={{ kind: 'single', row: editableStackableRow }}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onRemoveItem={vi.fn()}
      />,
    )

    expect(screen.getByText('5 SP each · 1 GP total')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove all 2 Rations' })).not.toBeInTheDocument()
    const decrease = screen.getByRole('button', { name: 'Decrease Rations quantity' })
    expect(decrease).toBeInTheDocument()
    expect(decrease.parentElement).toHaveClass('h-8')
    expect(screen.getByRole('button', { name: 'Increase Rations quantity' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increase Rations quantity' }))
    expect(onSetPurchaseQuantity).toHaveBeenCalledWith(
      { kind: 'purchase', purchaseId: 'purchase-row-test-0' },
      3,
    )
  })

  it('keeps the stepper visible for quantities at or above 10', () => {
    render(
      <EquipmentInventoryRowItem
        display={{
          kind: 'single',
          row: {
            ...editableStackableRow,
            entry: { ...editableStackableRow.entry, quantity: 12 },
            priceLineLabel: '5 SP each · 6 GP total',
            removeLabel: 'Remove all 12 Rations',
          },
        }}
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Increase Rations quantity' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit quantity for Rations' }),
    ).not.toBeInTheDocument()
  })

  it('omits remove for package grants', () => {
    const row: EquipmentInventoryRow = {
      group: 'weapons',
      groupLabel: 'Weapons',
      entry: {
        equipmentId: 'srd-cc-5.2.1:dagger',
        quantity: 2,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: equipmentStepBardClassFixture.id,
            grantId: 'standard-equipment',
          },
        ],
      },
      equipmentName: 'Dagger',
      sourceLabel: '2 included with Standard Equipment',
      isStackable: false,
      quantityMode: 'locked',
      priceLineLabel: '2 GP each · Qty 2 · 4 GP total',
      removeLabel: 'Remove all 2 Dagger',
      removeTarget: {
        kind: 'package',
        packageItemKey: `${equipmentStepBardClassFixture.id}:standard-equipment:0`,
      },
    }

    render(<EquipmentInventoryRowItem display={{ kind: 'single', row }} onRemoveItem={vi.fn()} />)

    const priceLine = screen.getByText('2 GP each · Qty 2 · 4 GP total')
    expect(priceLine).toHaveClass('text-sm')
    expect(screen.queryByText('Qty 2')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Remove all/ })).not.toBeInTheDocument()
  })

  it('allows zero quantity when allowZeroQuantity is enabled', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()

    render(
      <EquipmentInventoryRowItem
        display={{
          kind: 'single',
          row: {
            ...editableStackableRow,
            entry: { ...editableStackableRow.entry, quantity: 1 },
            removeLabel: 'Remove Rations',
          },
        }}
        allowZeroQuantity
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onRemoveItem={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Decrease Rations quantity' }))
    expect(onSetPurchaseQuantity).toHaveBeenCalledWith(
      { kind: 'purchase', purchaseId: 'purchase-row-test-0' },
      0,
    )
  })

  it('renders staged removal rows visibly with muted styling', () => {
    render(
      <EquipmentInventoryRowItem
        display={{
          kind: 'single',
          row: {
            ...editableStackableRow,
            entry: { ...editableStackableRow.entry, quantity: 0 },
            sourceLabel: 'Staged for removal',
            stagedRemoval: true,
            removeLabel: 'Remove Rations',
          },
        }}
        allowZeroQuantity
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    expect(screen.getByText('Rations')).toBeInTheDocument()
    expect(screen.getByText('Staged for removal')).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Rations quantity' })).toHaveValue(0)
  })

  it('renders a plus prefix when another source already provides the item', () => {
    render(
      <EquipmentInventoryRowItem
        display={{
          kind: 'single',
          row: {
            ...editableStackableRow,
            equipmentName: 'Dagger',
            entry: { ...editableStackableRow.entry, quantity: 2 },
          },
        }}
        otherSourceQuantity={2}
        detailLabelOverride="Package ×2 · Purchased · 4 GP"
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    expect(screen.getByText('+')).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', {
        name: 'Additional Dagger purchased, 2 from other sources',
      }),
    ).toHaveValue(2)
    expect(screen.getByText('Package ×2 · Purchased · 4 GP')).toBeInTheDocument()
  })

  it('renders a plain quantity when the purchase is the only source', () => {
    render(
      <EquipmentInventoryRowItem
        display={{
          kind: 'single',
          row: {
            ...editableStackableRow,
            equipmentName: 'Amulet',
            entry: { ...editableStackableRow.entry, quantity: 1 },
            removeLabel: 'Remove Amulet',
          },
        }}
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    expect(screen.getByRole('spinbutton', { name: 'Amulet quantity' })).toHaveValue(1)
    expect(screen.queryByText('+')).not.toBeInTheDocument()
  })

  it('removes only the purchase when trash is used on a plus-one row', async () => {
    const onRemoveItem = vi.fn()
    const onSetPurchaseQuantity = vi.fn()
    const user = userEvent.setup()

    render(
      <EquipmentInventoryRowItem
        display={{
          kind: 'single',
          row: {
            ...editableStackableRow,
            equipmentName: 'Dagger',
            entry: { ...editableStackableRow.entry, quantity: 1 },
            removeLabel: 'Remove Dagger',
          },
        }}
        otherSourceQuantity={2}
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onRemoveItem={onRemoveItem}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Dagger' }))

    expect(onRemoveItem).toHaveBeenCalledWith({
      kind: 'purchase',
      purchaseId: 'purchase-row-test-0',
    })
    expect(onSetPurchaseQuantity).not.toHaveBeenCalled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentInventoryRowItem
        display={{ kind: 'single', row: editableStackableRow }}
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations with staged removal', async () => {
    const { container } = render(
      <EquipmentInventoryRowItem
        display={{ kind: 'single', row: editableStackableRow }}
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
