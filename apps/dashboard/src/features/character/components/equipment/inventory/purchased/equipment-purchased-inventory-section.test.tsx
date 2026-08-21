import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE,
  type EquipmentInventoryRow,
} from '../../../../lib/equipment/equipment-step.lib'
import { EquipmentPurchasedInventorySection } from '../purchased/equipment-purchased-inventory-section'
import type { PurchasedCategoryGroup } from '../../../../lib/equipment/equipment-inventory-summary.lib'

const stackableRow: EquipmentInventoryRow = {
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
  removeTarget: { kind: 'purchase', purchaseId: 'purchase-rations' },
  quantityTarget: { kind: 'purchase', purchaseId: 'purchase-rations' },
}

const weaponRow: EquipmentInventoryRow = {
  group: 'weapons',
  groupLabel: 'Weapons',
  entry: {
    equipmentId: 'srd-cc-5.2.1:dagger',
    quantity: 1,
    sources: [{ kind: 'startingGold' }],
  },
  equipmentName: 'Dagger',
  sourceLabel: 'Purchased with starting gold',
  isStackable: false,
  quantityMode: 'editable',
  maxQuantity: 1,
  priceLineLabel: '2 GP each',
  removeLabel: 'Remove Dagger',
  removeTarget: { kind: 'purchase', purchaseId: 'purchase-dagger' },
  quantityTarget: { kind: 'purchase', purchaseId: 'purchase-dagger' },
}

const purchasedWithHeadings: PurchasedCategoryGroup[] = [
  {
    group: 'gear',
    groupLabel: 'Gear',
    displays: [{ kind: 'single', row: stackableRow }],
  },
  {
    group: 'weapons',
    groupLabel: 'Weapons',
    displays: [{ kind: 'single', row: weaponRow }],
  },
]

describe('EquipmentPurchasedInventorySection', () => {
  it('renders a centered inset panel when there are no purchases', () => {
    const { container } = render(<EquipmentPurchasedInventorySection purchased={[]} />)

    expect(screen.getByText(EQUIPMENT_PURCHASED_INVENTORY_EMPTY_MESSAGE)).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-sunken')
    expect(container.firstChild).toHaveClass('text-center')
    expect(container.firstChild).not.toHaveClass('border-dashed')
  })

  it('renders category headings by default', () => {
    render(<EquipmentPurchasedInventorySection purchased={purchasedWithHeadings} />)

    expect(screen.getByText('Gear')).toBeInTheDocument()
    expect(screen.getByText('Weapons')).toBeInTheDocument()
    expect(screen.getByText('Rations')).toBeInTheDocument()
    expect(screen.getByText('Dagger')).toBeInTheDocument()
  })

  it('renders a flat list without headings when showGroupHeadings is false', () => {
    const { container } = render(
      <EquipmentPurchasedInventorySection
        purchased={purchasedWithHeadings}
        showGroupHeadings={false}
      />,
    )

    expect(screen.queryByText('Gear')).not.toBeInTheDocument()
    expect(screen.queryByText('Weapons')).not.toBeInTheDocument()
    expect(screen.getByText('Rations')).toBeInTheDocument()
    expect(screen.getByText('Dagger')).toBeInTheDocument()
    expect(container.querySelectorAll('section')).toHaveLength(0)
  })

  it('keeps zero-quantity staged rows visible when allowZeroQuantity is enabled', async () => {
    const user = userEvent.setup()
    const onSetPurchaseQuantity = vi.fn()
    const stagedRow: EquipmentInventoryRow = {
      ...stackableRow,
      entry: { ...stackableRow.entry, quantity: 0 },
      sourceLabel: 'Staged for removal',
      stagedRemoval: true,
      removeLabel: 'Remove Rations',
    }

    render(
      <EquipmentPurchasedInventorySection
        purchased={[
          {
            group: 'gear',
            groupLabel: 'Gear',
            displays: [{ kind: 'single', row: stagedRow }],
          },
        ]}
        showGroupHeadings={false}
        allowZeroQuantity
        onSetPurchaseQuantity={onSetPurchaseQuantity}
        onRemoveItem={vi.fn()}
      />,
    )

    expect(screen.getByText('Staged for removal')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Increase Rations quantity' }))
    expect(onSetPurchaseQuantity).toHaveBeenCalledWith(
      { kind: 'purchase', purchaseId: 'purchase-rations' },
      1,
    )
  })

  itAxe('has no axe accessibility violations with headings', async () => {
    const { container } = render(
      <EquipmentPurchasedInventorySection purchased={purchasedWithHeadings} />,
    )

    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations without headings', async () => {
    const { container } = render(
      <EquipmentPurchasedInventorySection
        purchased={purchasedWithHeadings}
        showGroupHeadings={false}
        allowZeroQuantity
        onSetPurchaseQuantity={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
