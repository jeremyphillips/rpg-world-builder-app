import { InsetPanel } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'
import { EquipmentPurchasedInventorySection } from './equipment-purchased-inventory-section.client'
import type { PurchasedCategoryGroup } from './equipment-inventory-summary.lib'

const stackableRow: EquipmentInventoryRow = {
  group: 'gear',
  groupLabel: 'Gear',
  entry: {
    equipmentId: 'srd-cc-5.2.1:rope',
    quantity: 3,
    sources: [{ kind: 'startingGold' }],
  },
  equipmentName: 'Rope',
  sourceLabel: 'Purchased with starting gold',
  isStackable: true,
  quantityMode: 'editable',
  maxQuantity: 3,
  priceLineLabel: '1 GP each · 3 GP total',
  removeLabel: 'Remove all 3 Rope',
  removeTarget: { kind: 'purchase', purchaseId: 'purchase-rope' },
  quantityTarget: { kind: 'purchase', purchaseId: 'purchase-rope' },
}

const stagedRow: EquipmentInventoryRow = {
  group: 'weapons',
  groupLabel: 'Weapons',
  entry: {
    equipmentId: 'srd-cc-5.2.1:dagger',
    quantity: 0,
    sources: [{ kind: 'startingGold' }],
  },
  equipmentName: 'Dagger',
  sourceLabel: 'Staged for removal',
  isStackable: true,
  quantityMode: 'editable',
  maxQuantity: 2,
  priceLineLabel: '2 GP each',
  removeLabel: 'Remove Dagger',
  removeTarget: { kind: 'purchase', purchaseId: 'purchase-dagger' },
  quantityTarget: { kind: 'purchase', purchaseId: 'purchase-dagger' },
  stagedRemoval: true,
}

const purchasedGroups: PurchasedCategoryGroup[] = [
  {
    group: 'gear',
    groupLabel: 'Gear',
    displays: [{ kind: 'single', row: stackableRow }],
  },
  {
    group: 'weapons',
    groupLabel: 'Weapons',
    displays: [{ kind: 'single', row: stagedRow }],
  },
]

function PurchasedInventorySectionDemo(args: {
  showGroupHeadings?: boolean
  allowZeroQuantity?: boolean
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'purchase-rope': 3,
    'purchase-dagger': 0,
  })

  const groups: PurchasedCategoryGroup[] = purchasedGroups.map((group) => ({
    ...group,
    displays: group.displays.map((display) => {
      if (display.kind !== 'single') return display

      const purchaseId = display.row.quantityTarget?.purchaseId
      const quantity = purchaseId
        ? (quantities[purchaseId] ?? display.row.entry.quantity)
        : display.row.entry.quantity

      return {
        kind: 'single' as const,
        row: {
          ...display.row,
          entry: { ...display.row.entry, quantity },
          stagedRemoval: quantity === 0,
          sourceLabel: quantity === 0 ? 'Staged for removal' : display.row.sourceLabel,
        },
      }
    }),
  }))

  return (
    <InsetPanel size="sm" className="rounded-lg">
      <EquipmentPurchasedInventorySection
        purchased={groups}
        showGroupHeadings={args.showGroupHeadings}
        allowZeroQuantity={args.allowZeroQuantity}
        onSetPurchaseQuantity={(target, quantity) => {
          setQuantities((current) => ({ ...current, [target.purchaseId]: quantity }))
        }}
        onRemoveItem={(target) => {
          if (target.kind !== 'purchase') return
          setQuantities((current) => ({ ...current, [target.purchaseId]: 0 }))
        }}
      />
    </InsetPanel>
  )
}

const meta = {
  title: 'Character Builder/EquipmentPurchasedInventorySection',
  component: EquipmentPurchasedInventorySection,
  parameters: { layout: 'padded' },
  args: {
    purchased: purchasedGroups,
  },
} satisfies Meta<typeof EquipmentPurchasedInventorySection>

export default meta
type Story = StoryObj<typeof meta>

export const WithGroupHeadings: Story = {
  args: {
    purchased: purchasedGroups,
  },
  render: () => <PurchasedInventorySectionDemo />,
}

export const FlatListWithoutHeadings: Story = {
  args: {
    purchased: purchasedGroups,
    showGroupHeadings: false,
    allowZeroQuantity: true,
  },
  render: () => <PurchasedInventorySectionDemo showGroupHeadings={false} allowZeroQuantity />,
}
