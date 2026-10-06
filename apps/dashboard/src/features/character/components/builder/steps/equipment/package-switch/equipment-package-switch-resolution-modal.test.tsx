import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
  type CharacterBuilderDraft,
  type ClassStored,
} from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import { storedDruidClassStored } from '@/test/fixtures/factories/additional/class-stored'
import { pickEquipment } from '@/test/fixtures/pick'

import { equipmentStepContextFixture } from '../../../../../lib/equipment/equipment-step.fixtures'
import {
  selectionFactsDraft,
  selectionFactsPurchase,
  selectionFactsScenario,
  selectionFactsWizardClass,
  selectionFactsWizardWithoutSpellbookClass,
} from '../../../../../lib/equipment/equipment-selection-facts.fixtures'
import { EquipmentPackageSwitchResolutionModal } from './equipment-package-switch-resolution-modal'
import { equipmentPackageSwitchResolutionModalInventoryScrollClasses } from './equipment-package-switch-resolution-modal.variants'

const rope = pickEquipment('rope')
const dagger = pickEquipment('dagger')
const storedDruid = storedDruidClassStored

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [storedDruid],
  spells: [],
  equipment: [rope, dagger],
  skillProficiencies: [],
  organizations: [],
  languages: [],
})

const goldDraft = {
  ...createEmptyCharacterBuilderDraft(),
  class: { classId: storedDruid.id, level: 1 as const },
  choiceSelections: {
    [startingEquipmentChoiceSetId(storedDruid.id)]: ['starting-gold'],
  },
  equipment: {
    mode: 'gold' as const,
    purchases: [
      {
        id: 'purchase-rope',
        equipmentId: rope.id,
        quantity: 62,
        sourceMode: 'startingGold' as const,
        origin: 'picker' as const,
      },
    ],
    editedSincePackageSelection: false,
  },
}

function targetFundingFor(draft: CharacterBuilderDraft, targetOptionId: string) {
  return resolveStartingEquipmentFundingOptions({ draft, catalogIndex }).get(targetOptionId)!
}

describe('EquipmentPackageSwitchResolutionModal reconciliation status', () => {
  function renderWizardTrim(characterClass: ClassStored) {
    const scenario = selectionFactsScenario({ classes: [characterClass] })
    const draft = selectionFactsDraft({
      characterClass,
      optionId: 'starting-gold',
      purchases: [
        selectionFactsPurchase('greatsword'),
        selectionFactsPurchase('component-pouch'),
        selectionFactsPurchase('spellbook'),
      ],
    })
    const targetFunding = resolveStartingEquipmentFundingOptions({
      draft,
      catalogIndex: scenario.catalogIndex,
    }).get('standard-equipment')!
    const switchEvaluation = evaluateEquipmentPackageSwitch({
      draft,
      catalogIndex: scenario.catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding,
    })!

    render(
      <EquipmentPackageSwitchResolutionModal
        open
        catalogIndex={scenario.catalogIndex}
        draft={draft}
        context={scenario.context}
        choiceSets={resolveAvailableChoices(draft, scenario.context)}
        evaluation={switchEvaluation}
        draftQuantitiesByPurchaseId={Object.fromEntries(
          switchEvaluation.editableItems.map((item) => [item.purchaseId, item.committedQuantity]),
        )}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )
  }

  function rowFor(name: string) {
    const row = screen.getByText(name).closest('li')
    if (!row) throw new Error(`No row for ${name}`)
    return within(row)
  }

  it('shows compatibility and open guidance without per-item affordability', () => {
    renderWizardTrim(selectionFactsWizardWithoutSpellbookClass)

    expect(rowFor('Greatsword').getByText('Not proficient')).toBeInTheDocument()
    expect(rowFor('Component Pouch').getByText('Recommended by class')).toBeInTheDocument()
    expect(rowFor('Spellbook').getByText('Required by class')).toBeInTheDocument()
    expect(screen.queryByText('Cannot afford')).not.toBeInTheDocument()
  })

  it('drops the spellbook requirement when the target package supplies one', () => {
    renderWizardTrim(selectionFactsWizardClass)

    expect(rowFor('Spellbook').queryByText('Required by class')).not.toBeInTheDocument()
    expect(rowFor('Greatsword').getByText('Not proficient')).toBeInTheDocument()
  })
})

describe('EquipmentPackageSwitchResolutionModal', () => {
  const evaluation = evaluateEquipmentPackageSwitch({
    draft: goldDraft,
    catalogIndex,
    targetOptionId: 'standard-equipment',
    targetFunding: targetFundingFor(goldDraft, 'standard-equipment'),
  })!

  it('renders the resolvable package-switch resolution dialog', () => {
    render(
      <EquipmentPackageSwitchResolutionModal
        open
        catalogIndex={catalogIndex}
        draft={goldDraft}
        context={equipmentStepContextFixture}
        choiceSets={[]}
        evaluation={evaluation}
        draftQuantitiesByPurchaseId={{ 'purchase-rope': 62 }}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Adjust purchases before switching' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rope')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch package' })).toBeDisabled()
  })

  it('keeps the purchased inventory list vertically scrollable without horizontal overflow', () => {
    render(
      <EquipmentPackageSwitchResolutionModal
        open
        catalogIndex={catalogIndex}
        draft={goldDraft}
        context={equipmentStepContextFixture}
        choiceSets={[]}
        evaluation={evaluation}
        draftQuantitiesByPurchaseId={{ 'purchase-rope': 62 }}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const scrollRegion = screen
      .getByRole('heading', { name: 'Current purchases' })
      .closest('section')?.parentElement

    expect(scrollRegion).not.toBeNull()
    for (const className of equipmentPackageSwitchResolutionModalInventoryScrollClasses.split(
      /\s+/,
    )) {
      expect(scrollRegion).toHaveClass(className)
    }
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentPackageSwitchResolutionModal
        open
        catalogIndex={catalogIndex}
        draft={goldDraft}
        context={equipmentStepContextFixture}
        choiceSets={[]}
        evaluation={evaluation}
        draftQuantitiesByPurchaseId={{ 'purchase-rope': 9 }}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })

  it('renders the blocked package-switch dialog without inventory controls', () => {
    const blockedDraft = {
      ...goldDraft,
      equipment: {
        ...goldDraft.equipment!,
        purchases: [
          {
            id: 'purchase-dagger',
            equipmentId: dagger.id,
            quantity: 10,
            sourceMode: 'manual' as const,
            origin: 'picker' as const,
          },
        ],
      },
    }
    const blockedEvaluation = evaluateEquipmentPackageSwitch({
      draft: blockedDraft,
      catalogIndex,
      targetOptionId: 'standard-equipment',
      targetFunding: targetFundingFor(blockedDraft, 'standard-equipment'),
    })!

    render(
      <EquipmentPackageSwitchResolutionModal
        open
        catalogIndex={catalogIndex}
        draft={blockedDraft}
        context={equipmentStepContextFixture}
        choiceSets={[]}
        evaluation={blockedEvaluation}
        draftQuantitiesByPurchaseId={{}}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Cannot switch packages' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Switch package' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Decrease Dagger quantity' }),
    ).not.toBeInTheDocument()
  })
})
