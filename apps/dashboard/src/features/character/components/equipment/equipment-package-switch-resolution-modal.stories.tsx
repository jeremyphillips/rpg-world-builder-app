import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import { equipmentSchema } from '@rpg/contracts'
import type { ClassStored, EquipmentPackageSwitchBlockingReason } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'
import { evaluateEquipmentPackageSwitch } from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import { EquipmentPackageSwitchResolutionModal } from './equipment-package-switch-resolution-modal.client'

const RULESET = 'srd-cc-5.2.1' as const

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const silverNeedle = equipmentSchema.parse({
  id: `${RULESET}:silver-needle`,
  slug: 'silver-needle',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Silver Needle',
  description: '',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 0, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const dagger = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
  properties: [],
  mastery: 'nick',
})

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light', 'shields'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard',
          label: 'Standard Equipment',
          items: [],
          wealth: { gp: 9, sp: 5, cp: 3 },
        },
        {
          id: 'gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
}

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [storedDruid],
  spells: [],
  equipment: [rope, silverNeedle, dagger],
  skillProficiencies: [],
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
      [startingEquipmentChoiceSetId(storedDruid.id)]: ['gold'],
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
        targetOptionId: 'standard',
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
