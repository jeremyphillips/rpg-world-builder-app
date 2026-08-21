import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import type { EquipmentPackageSwitchBlockingReason } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import { storedDruidClassStored } from '@/test/fixtures/factories/additional/class-stored'
import { pickEquipment } from '@/test/fixtures/pick'

import { EquipmentPackageSwitchResolutionModal } from './equipment-package-switch-resolution-modal'

const rope = pickEquipment('rope')
const silverNeedle = pickEquipment('silver-needle')
const dagger = pickEquipment('dagger')
const storedDruid = storedDruidClassStored

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [storedDruid],
  spells: [],
  equipment: [rope, silverNeedle, dagger],
  skillProficiencies: [],
  organizations: [],
  languages: [],
})

function buildGoldDraft(
  purchases: Array<{
    id: string
    equipmentId: string
    quantity: number
    sourceMode?: 'startingGold' | 'manual'
  }>,
) {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: storedDruid.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(storedDruid.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold' as const,
      purchases: purchases.map((purchase) => ({
        id: purchase.id,
        equipmentId: purchase.equipmentId,
        quantity: purchase.quantity,
        sourceMode: purchase.sourceMode ?? ('startingGold' as const),
        origin: 'picker' as const,
      })),
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

type PackageSwitchResolutionModalStoryArgs = {
  initialQuantities: Record<string, number>
  commitErrorReason?: EquipmentPackageSwitchBlockingReason
  staleNotice?: boolean
  purchases: Array<{
    id: string
    equipmentId: string
    quantity: number
    sourceMode?: 'startingGold' | 'manual'
  }>
}

function PackageSwitchResolutionModalStory({
  initialQuantities,
  commitErrorReason,
  staleNotice = false,
  purchases,
}: PackageSwitchResolutionModalStoryArgs) {
  const [open, setOpen] = useState(true)
  const [draftQuantities, setDraftQuantities] = useState(initialQuantities)

  const draft = useMemo(() => buildGoldDraft(purchases), [purchases])
  const evaluation = useMemo(
    () =>
      evaluateEquipmentPackageSwitch({
        draft,
        catalogIndex,
        targetOptionId: 'standard-equipment',
        targetFunding: resolveStartingEquipmentFundingOptions({ draft, catalogIndex }).get(
          'standard-equipment',
        )!,
        draftQuantitiesByPurchaseId: draftQuantities,
      })!,
    [draft, draftQuantities],
  )

  return (
    <EquipmentPackageSwitchResolutionModal
      open={open}
      catalogIndex={catalogIndex}
      evaluation={evaluation}
      draftQuantitiesByPurchaseId={draftQuantities}
      commitErrorReason={commitErrorReason}
      staleNotice={staleNotice}
      onOpenChange={setOpen}
      onDraftQuantityChange={(purchaseId, quantity) => {
        setDraftQuantities((current) => ({ ...current, [purchaseId]: quantity }))
      }}
      onConfirm={() => setOpen(false)}
    />
  )
}

const meta = {
  title: 'Character Builder/EquipmentPackageSwitchResolutionModal',
  component: PackageSwitchResolutionModalStory,
  parameters: { layout: 'padded' },
  args: {
    purchases: [{ id: 'purchase-rope', equipmentId: rope.id, quantity: 62 }],
    initialQuantities: { 'purchase-rope': 62 },
  },
} satisfies Meta<typeof PackageSwitchResolutionModalStory>

export default meta
type Story = StoryObj<typeof meta>

export const OverBudget: Story = {}

export const StagedRemoval: Story = {
  args: {
    purchases: [{ id: 'purchase-rope', equipmentId: rope.id, quantity: 62 }],
    initialQuantities: { 'purchase-rope': 0 },
  },
}

export const MixedDenominationResolved: Story = {
  args: {
    purchases: [{ id: 'purchase-needle', equipmentId: silverNeedle.id, quantity: 200 }],
    initialQuantities: { 'purchase-needle': 19 },
  },
}

export const BlockedNonEditableOverage: Story = {
  args: {
    purchases: [
      { id: 'purchase-dagger', equipmentId: dagger.id, quantity: 10, sourceMode: 'manual' },
    ],
    initialQuantities: {},
  },
}

export const StaleInventoryRefresh: Story = {
  args: {
    purchases: [{ id: 'purchase-rope', equipmentId: rope.id, quantity: 62 }],
    initialQuantities: { 'purchase-rope': 40 },
    staleNotice: true,
  },
}

export const CommitError: Story = {
  args: {
    purchases: [{ id: 'purchase-rope', equipmentId: rope.id, quantity: 62 }],
    initialQuantities: { 'purchase-rope': 50 },
    commitErrorReason: { kind: 'draftOverBudget', amountOverBudgetCp: 4700 },
  },
}
