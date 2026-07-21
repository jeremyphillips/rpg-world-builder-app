import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { equipmentSchema } from '@rpg/contracts'
import type { ClassStored } from '@rpg/contracts'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '@rpg/contracts'
import {
  evaluateEquipmentPackageSwitch,
  resolveStartingEquipmentFundingOptions,
} from '@rpg/contracts'
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
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            { kind: 'grant', target: { source: 'equipment', equipmentSlug: 'rope' }, quantity: 1 },
          ],
          wealth: { gp: 9, sp: 5, cp: 3 },
        },
        {
          id: 'starting-gold',
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
  equipment: [rope, dagger],
  skillProficiencies: [],
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

  it('has no axe accessibility violations', async () => {
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
