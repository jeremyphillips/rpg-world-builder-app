import type { Meta, StoryObj } from '@storybook/react-vite'

import type { MagicItemAllowance, MagicItemGrantProgress } from '@rpg/contracts'

import { equipmentPickerBudgetFixture } from '../picker/drawer/equipment-picker-drawer.fixtures'
import { EquipmentAcquisitionGuidance } from './equipment-acquisition-guidance'

const magicItemAllowances: MagicItemAllowance[] = [
  {
    id: 'allowance-common',
    source: { kind: 'startingWealthTier', sourceId: 'table', tierId: 'hero' },
    rarity: 'common',
    count: 2,
    requirement: 'exact',
  },
  {
    id: 'allowance-uncommon',
    source: { kind: 'startingWealthTier', sourceId: 'table', tierId: 'hero' },
    rarity: 'uncommon',
    count: 1,
    requirement: 'up_to',
  },
]

const magicItemProgress: MagicItemGrantProgress[] = [
  {
    allowanceId: 'allowance-common',
    rarity: 'common',
    capacity: 2,
    selected: 2,
    remainingCapacity: 0,
    isFilled: true,
  },
  {
    allowanceId: 'allowance-uncommon',
    rarity: 'uncommon',
    capacity: 1,
    selected: 0,
    remainingCapacity: 1,
    isFilled: false,
  },
]

const meta = {
  title: 'Character Builder/EquipmentAcquisitionGuidance',
  component: EquipmentAcquisitionGuidance,
  parameters: { layout: 'padded' },
  args: {
    showPurchaseWorkflow: true,
    fundingState: { kind: 'funded', budget: equipmentPickerBudgetFixture },
    onOpenPurchasePicker: () => undefined,
    showMagicItemGrants: true,
    magicItemAllowances,
    magicItemProgress,
    onOpenMagicItemsPicker: () => undefined,
  },
} satisfies Meta<typeof EquipmentAcquisitionGuidance>

export default meta
type Story = StoryObj<typeof meta>

export const DualWorkflow: Story = {}

export const PurchaseOnly: Story = {
  args: {
    showMagicItemGrants: false,
    magicItemAllowances: [],
    magicItemProgress: [],
  },
}

export const MagicItemsOnly: Story = {
  args: {
    showPurchaseWorkflow: false,
    fundingState: { kind: 'none' },
  },
}

export const UnresolvedFunding: Story = {
  args: {
    showPurchaseWorkflow: false,
    fundingState: { kind: 'unresolved', pendingCostCp: 5150 },
    showMagicItemGrants: false,
    magicItemAllowances: [],
    magicItemProgress: [],
  },
}

export const UnresolvedFundingWithMagicItems: Story = {
  args: {
    showPurchaseWorkflow: false,
    fundingState: { kind: 'unresolved', pendingCostCp: 5150 },
  },
}
