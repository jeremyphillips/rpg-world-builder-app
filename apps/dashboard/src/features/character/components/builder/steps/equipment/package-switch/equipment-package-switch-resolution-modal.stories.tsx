import type { Meta, StoryObj } from '@storybook/react-vite'
import { useMemo, useState } from 'react'

import type { EquipmentPackageSwitchBlockingReason } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import { storedDruidClassStored } from '@/test/fixtures/factories/additional/class-stored'
import { pickEquipment } from '@/test/fixtures/pick'

import { createEquipmentStepContextFixture } from '../../../../../lib/equipment/equipment-step.fixtures'
import {
  selectionFactsDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
  selectionFactsWizardWithoutSpellbookClass,
} from '../../../../../lib/equipment/equipment-selection-facts.fixtures'
import { EquipmentPackageSwitchResolutionModal } from './equipment-package-switch-resolution-modal'

const rope = pickEquipment('rope')
const silverNeedle = pickEquipment('silver-needle')
const dagger = pickEquipment('dagger')
const storedDruid = storedDruidClassStored

const storyCatalog = {
  species: [],
  classes: [storedDruid],
  spells: [],
  equipment: [rope, silverNeedle, dagger],
  skillProficiencies: [],
  organizations: [],
  languages: [],
}
const catalogIndex = indexCharacterBuildCatalog(storyCatalog)
const storyContext = createEquipmentStepContextFixture({ catalog: storyCatalog })

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
      purchases: purchases.map((purchase) => {
        const row = {
          id: purchase.id,
          equipmentId: purchase.equipmentId,
          quantity: purchase.quantity,
        }
        return purchase.sourceMode === 'manual'
          ? { ...row, sourceMode: 'manual' as const }
          : { ...row, sourceMode: 'startingGold' as const, origin: 'picker' as const }
      }),
      editedSincePackageSelection: false,
    },
  }
}

type PackageSwitchResolutionModalStoryArgs = {
  initialQuantities: Record<string, number>
  commitErrorReason?: EquipmentPackageSwitchBlockingReason
  staleNotice?: boolean
  isInitialSelection?: boolean
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
  isInitialSelection = false,
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
      draft={draft}
      context={storyContext}
      choiceSets={[]}
      evaluation={evaluation}
      draftQuantitiesByPurchaseId={draftQuantities}
      commitErrorReason={commitErrorReason}
      staleNotice={staleNotice}
      isInitialSelection={isInitialSelection}
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

export const InitialSelectionAfterClassChange: Story = {
  args: {
    isInitialSelection: true,
  },
}

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

const wizardTrimScenario = selectionFactsScenario({
  classes: [selectionFactsWizardWithoutSpellbookClass],
})
const wizardTrimDraft = selectionFactsDraft({
  characterClass: selectionFactsWizardWithoutSpellbookClass,
  optionId: 'starting-gold',
  purchases: [
    selectionFactsPurchase('greatsword'),
    selectionFactsPurchase('component-pouch'),
    selectionFactsPurchase('spellbook'),
  ],
})
const wizardTrimChoiceSets = resolveAvailableChoices(wizardTrimDraft, wizardTrimScenario.context)

function WizardReconciliationStory() {
  const [open, setOpen] = useState(true)
  const [draftQuantities, setDraftQuantities] = useState<Record<string, number>>({})
  const { catalogIndex: wizardCatalogIndex, context } = wizardTrimScenario
  const evaluation = useMemo(
    () =>
      evaluateEquipmentPackageSwitch({
        draft: wizardTrimDraft,
        catalogIndex: wizardCatalogIndex,
        targetOptionId: 'standard-equipment',
        targetFunding: resolveStartingEquipmentFundingOptions({
          draft: wizardTrimDraft,
          catalogIndex: wizardCatalogIndex,
        }).get('standard-equipment')!,
        draftQuantitiesByPurchaseId: draftQuantities,
      })!,
    [draftQuantities, wizardCatalogIndex],
  )

  return (
    <EquipmentPackageSwitchResolutionModal
      open={open}
      catalogIndex={wizardCatalogIndex}
      draft={wizardTrimDraft}
      context={context}
      choiceSets={wizardTrimChoiceSets}
      evaluation={evaluation}
      draftQuantitiesByPurchaseId={draftQuantities}
      onOpenChange={setOpen}
      onDraftQuantityChange={(purchaseId, quantity) => {
        setDraftQuantities((current) => ({ ...current, [purchaseId]: quantity }))
      }}
      onConfirm={() => setOpen(false)}
    />
  )
}

/** STR 8 Wizard switching to a package without a spellbook (reconciliation context). */
export const ReconciliationStatus: Story = {
  render: () => <WizardReconciliationStory />,
}
