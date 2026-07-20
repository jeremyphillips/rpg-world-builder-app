import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../lib/equipment-step.fixtures'
import { EquipmentInventoryManagePanel } from './equipment-inventory-manage-panel.client'
import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'

const rows: EquipmentInventoryRow[] = [
  {
    group: 'magicItems',
    groupLabel: 'Magic Items',
    entry: {
      equipmentId: 'srd-cc-5.2.1:potion-of-healing',
      quantity: 2,
      sources: [{ kind: 'startingWealthTier', sourceId: 'tier', grantId: 'allowance-common' }],
    },
    equipmentName: 'Potion of Healing',
    sourceLabel: 'Common choice',
    isStackable: true,
    quantityMode: 'locked',
    removeLabel: 'Release choice Potion of Healing',
    removeTarget: {
      kind: 'magicItemGrant',
      allowanceId: 'allowance-common',
      equipmentId: 'srd-cc-5.2.1:potion-of-healing',
    },
  },
]

const meta = {
  title: 'Character Builder/EquipmentInventoryManagePanel',
  component: EquipmentInventoryManagePanel,
  parameters: { layout: 'padded' },
  args: {
    equipmentName: 'Potion of Healing',
    rows,
    draft: createEmptyCharacterBuilderDraft(),
    context: equipmentStepContextFixture,
    catalogIndex: equipmentStepCatalogIndexFixture,
    onReleaseGrant: () => undefined,
    onRemovePurchase: () => undefined,
    onAddAnother: () => undefined,
  },
} satisfies Meta<typeof EquipmentInventoryManagePanel>

export default meta
type Story = StoryObj<typeof meta>

export const GrantOnly: Story = {}

export const MixedSource: Story = {
  args: {
    equipment: equipmentStepPotionOfHealingFixture,
    rows: [
      ...rows,
      {
        group: 'magicItems',
        groupLabel: 'Magic Items',
        entry: {
          equipmentId: equipmentStepPotionOfHealingFixture.id,
          quantity: 1,
          sources: [{ kind: 'startingGold' }],
        },
        equipment: equipmentStepPotionOfHealingFixture,
        equipmentName: 'Potion of Healing',
        sourceLabel: 'Purchased with starting gold',
        isStackable: true,
        quantityMode: 'editable',
        removeLabel: 'Remove Potion of Healing',
        removeTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
        quantityTarget: { kind: 'purchase', purchaseId: 'purchase-1' },
      },
    ],
  },
}
