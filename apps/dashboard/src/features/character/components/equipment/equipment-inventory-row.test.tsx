import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { equipmentStepBardClassFixture } from '../../lib/equipment-step.fixtures'
import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'
import { EquipmentInventoryRowItem } from './equipment-inventory-row.client'

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
  it('renders price line with borderless stepper and text remove for editable stackables', async () => {
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
    expect(screen.getByRole('button', { name: 'Remove all 2 Rations' })).toHaveTextContent('Remove')
    expect(
      screen.getByRole('button', { name: 'Increase Quantity for Rations' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Increase Quantity for Rations' }))
    expect(onSetPurchaseQuantity).toHaveBeenCalledWith(
      { kind: 'purchase', purchaseId: 'purchase-row-test-0' },
      3,
    )
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
            grantId: 'standard',
          },
        ],
      },
      equipmentName: 'Dagger',
      sourceLabel: '2 included with Standard Equipment',
      isStackable: false,
      quantityMode: 'locked',
      priceLineLabel: '2 GP value · 4 GP total value',
      removeLabel: 'Remove all 2 Dagger',
      removeTarget: {
        kind: 'package',
        packageItemKey: `${equipmentStepBardClassFixture.id}:standard:0`,
      },
    }

    render(<EquipmentInventoryRowItem display={{ kind: 'single', row }} onRemoveItem={vi.fn()} />)

    expect(screen.getByText('Qty 2')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
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
