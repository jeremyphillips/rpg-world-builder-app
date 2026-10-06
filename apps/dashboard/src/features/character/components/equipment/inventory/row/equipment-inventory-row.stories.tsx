import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Text } from '@rpg/ui'

import { EquipmentInventoryRowItem } from '../row/equipment-inventory-row'
import type { EquipmentInventoryRow } from '../../../../lib/equipment/equipment-step.lib'

const editableStartingGoldRow: EquipmentInventoryRow = {
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
  removeTarget: { kind: 'purchase', purchaseId: 'purchase-story-0' },
  quantityTarget: { kind: 'purchase', purchaseId: 'purchase-story-0' },
}

const lockedPackageGrantRow: EquipmentInventoryRow = {
  group: 'weapons',
  groupLabel: 'Weapons',
  entry: {
    equipmentId: 'srd-cc-5.2.1:dagger',
    quantity: 2,
    sources: [
      {
        kind: 'classStartingEquipment',
        sourceId: 'srd-cc-5.2.1:bard',
        grantId: 'standard-equipment',
      },
    ],
  },
  equipmentName: 'Dagger',
  sourceLabel: '2 included with Standard Equipment',
  isStackable: false,
  quantityMode: 'locked',
  removeLabel: 'Remove all 2 Dagger',
  removeTarget: { kind: 'package', packageItemKey: 'srd-cc-5.2.1:bard:standard-equipment:0' },
}

const meta = {
  title: 'Character Builder/EquipmentInventoryRow',
  component: EquipmentInventoryRowItem,
  args: {
    onRemoveItem: () => undefined,
    onSetPurchaseQuantity: () => undefined,
  },
} satisfies Meta<typeof EquipmentInventoryRowItem>

export default meta
type Story = StoryObj<typeof meta>

export const AdditionalPurchase: Story = {
  tags: ['storybook-test-runner-skip'],
  args: {
    display: { kind: 'single', row: editableStartingGoldRow },
    detailLabelOverride: 'Package ×2 · Purchased · 4 GP',
    otherSourceQuantity: 2,
  },
  render: function AdditionalPurchaseStory(args) {
    const [quantity, setQuantity] = useState(2)
    if (quantity < 1) {
      return <Text variant="muted">Purchase removed. The package contribution stays.</Text>
    }

    const baseRow = args.display.kind === 'single' ? args.display.row : editableStartingGoldRow
    return (
      <EquipmentInventoryRowItem
        {...args}
        display={{
          kind: 'single',
          row: {
            ...baseRow,
            equipmentName: 'Dagger',
            entry: { ...baseRow.entry, quantity },
            removeLabel: 'Remove Dagger',
          },
        }}
        onSetPurchaseQuantity={(_target, next) => setQuantity(next)}
        onRemoveItem={() => setQuantity(0)}
      />
    )
  },
}

export const EditableStartingGold: Story = {
  tags: ['storybook-test-runner-skip'],
  args: {
    display: { kind: 'single', row: editableStartingGoldRow },
  },
}

export const LockedPackageGrant: Story = {
  tags: ['storybook-test-runner-skip'],
  args: {
    display: { kind: 'single', row: lockedPackageGrantRow },
  },
}

export const CombinedSourceBreakdown: Story = {
  tags: ['storybook-test-runner-skip'],
  args: {
    display: {
      kind: 'combined',
      group: 'gear',
      equipmentId: 'srd-cc-5.2.1:arrows',
      equipmentName: 'Arrows',
      totalQuantity: 7,
      breakdownLabel: '7 total · 5 included · 2 purchased',
      bundleLabel: '20 arrows per bundle',
      rows: [
        lockedPackageGrantRow,
        {
          ...editableStartingGoldRow,
          equipmentName: 'Arrows',
          entry: {
            equipmentId: 'srd-cc-5.2.1:arrows',
            quantity: 2,
            sources: [{ kind: 'startingGold' }],
          },
          priceLineLabel: '1 GP each · 2 GP total',
        },
      ],
    },
  },
}

export const HighQuantity: Story = {
  tags: ['storybook-test-runner-skip'],
  args: {
    display: {
      kind: 'single',
      row: {
        ...editableStartingGoldRow,
        entry: { ...editableStartingGoldRow.entry, quantity: 12 },
        priceLineLabel: '5 SP each · 6 GP total',
        removeLabel: 'Remove all 12 Rations',
      },
    },
  },
}
