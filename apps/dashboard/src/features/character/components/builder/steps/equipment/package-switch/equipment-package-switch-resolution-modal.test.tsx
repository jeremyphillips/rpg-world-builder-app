import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'
import { startingEquipmentChoiceSetId } from '@rpg/contracts'

import { storedDruidClassStored } from '@/test/fixtures/factories/additional/class-stored'
import { pickEquipment } from '@/test/fixtures/pick'

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
    removedPackageItemKeys: [],
    customized: false,
  },
}

function targetFundingFor(draft: CharacterBuilderDraft, targetOptionId: string) {
  return resolveStartingEquipmentFundingOptions({ draft, catalogIndex }).get(targetOptionId)!
}

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
        evaluation={evaluation}
        draftQuantitiesByPurchaseId={{ 'purchase-rope': 62 }}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Resolve purchases before switching' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Rope')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Switch package' })).toBeDisabled()
  })

  it('keeps the purchased inventory list vertically scrollable without horizontal overflow', () => {
    render(
      <EquipmentPackageSwitchResolutionModal
        open
        catalogIndex={catalogIndex}
        evaluation={evaluation}
        draftQuantitiesByPurchaseId={{ 'purchase-rope': 62 }}
        onOpenChange={vi.fn()}
        onDraftQuantityChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    )

    const scrollRegion = screen
      .getByRole('heading', { name: 'Purchased with starting gold' })
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
