import type { Meta, StoryObj } from '@storybook/react-vite'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepContextFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../../../lib/equipment/equipment-step.fixtures'
import {
  EquipmentInventoryManageDisclosureCard,
  createStorybookApplyMagicItemAcquisition,
} from '../manage/equipment-inventory-manage-panel.client'
import type { EquipmentInventoryRow } from '../../../../lib/equipment/equipment-step.lib'

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
    equipment: equipmentStepPotionOfHealingFixture,
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
  title: 'Character Builder/EquipmentInventoryManageDisclosureCard',
  component: EquipmentInventoryManageDisclosureCard,
  parameters: { layout: 'padded' },
  args: {
    itemId: 'potion-of-healing',
    equipmentName: 'Potion of Healing',
    provenanceLabel: '2 Common choices',
    equipment: equipmentStepPotionOfHealingFixture,
    rows,
    draft: createEmptyCharacterBuilderDraft(),
    context: equipmentStepContextFixture,
    catalogIndex: equipmentStepCatalogIndexFixture,
    onReleaseGrant: () => undefined,
    onRemovePurchase: () => undefined,
    onApplyMagicItemAcquisition: createStorybookApplyMagicItemAcquisition({
      draft: createEmptyCharacterBuilderDraft(),
      context: equipmentStepContextFixture,
      catalogIndex: equipmentStepCatalogIndexFixture,
    }),
  },
} satisfies Meta<typeof EquipmentInventoryManageDisclosureCard>

export default meta
type Story = StoryObj<typeof meta>

export const GrantOnly: Story = {}

export const MixedSource: Story = {
  args: {
    equipment: equipmentStepPotionOfHealingFixture,
    provenanceLabel: '2 Common choices · Purchased',
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
