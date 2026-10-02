import { describe, expect, it } from 'vitest'

import {
  deriveEquipmentDraftEntries,
  indexCharacterBuildCatalog,
  startingEquipmentChoiceSetId,
  type CharacterBuildContext,
  type NpcStartingChoices,
} from '@rpg/contracts'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import {
  createEquipmentStepContextFixture,
  equipmentStepBattleaxeFixture,
  equipmentStepCatalogFixture,
  equipmentStepContextFixture,
  equipmentStepMonkClassFixture,
  equipmentStepRationsFixture,
  equipmentStepSpearFixture,
} from '@/features/character/lib/equipment/equipment-step.fixtures'
import { makeSpecies } from '@/test/fixtures/factories/species'

import { prepareQuickNpcAuthoringCreate } from './quick-npc-authoring-submit.lib'
import { quickNpcAuthoringTabDefaultValues } from './quick-npc-form-fields'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'
import {
  presentQuickNpcEquipmentOption,
  projectQuickNpcEquipmentAllocations,
} from './quick-npc-equipment-supply.lib'
import type { QuickNpcAdditionalEquipmentOption } from './quick-npc-additional-equipment.lib'

const catalogIndex = indexCharacterBuildCatalog(
  (equipmentStepContextFixture as CharacterBuildContext).catalog,
)

describe('projectQuickNpcEquipmentAllocations', () => {
  it('sums classless origins and keeps classed manual quantity for every kind', () => {
    expect(
      projectQuickNpcEquipmentAllocations({
        catalogIndex,
        classed: false,
        equipmentSelections: [
          { equipmentId: equipmentStepRationsFixture.id, quantity: 1, origin: 'role-default' },
          { equipmentId: equipmentStepRationsFixture.id, quantity: 2, origin: 'manual' },
        ],
      }).startingEquipmentGrants,
    ).toEqual([{ equipmentId: equipmentStepRationsFixture.id, quantity: 3 }])

    const classed = projectQuickNpcEquipmentAllocations({
      catalogIndex,
      classed: true,
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
        { equipmentId: equipmentStepRationsFixture.id, quantity: 4, origin: 'manual' },
      ],
    })
    expect(classed.requiredWeaponIds).toEqual([])
    expect(classed.manualEquipmentGrantIds).toEqual([])
    expect(classed.startingEquipmentGrants).toEqual([
      { equipmentId: equipmentStepSpearFixture.id, quantity: 2 },
      { equipmentId: equipmentStepRationsFixture.id, quantity: 4 },
    ])
  })
})

function ownedQuantity(
  inventory: ReturnType<typeof deriveEquipmentDraftEntries>,
  equipmentId: string,
): number {
  return [...inventory.weapons, ...inventory.armor, ...inventory.gear]
    .filter((entry) => entry.equipmentId === equipmentId)
    .reduce((total, entry) => total + entry.quantity, 0)
}

describe('manual equipment does not steer the class package', () => {
  const species = makeSpecies({ slug: 'scout', name: 'Scout' })
  const kitClass = {
    ...equipmentStepMonkClassFixture,
    characterCreation: {
      startingEquipment: {
        choose: 1,
        options: [
          {
            id: 'spear-kit',
            label: 'Spear Kit',
            items: [
              {
                kind: 'grant' as const,
                target: { source: 'equipment' as const, equipmentSlug: 'spear' },
                quantity: 1,
              },
            ],
            wealth: { gp: 0 },
          },
          {
            id: 'axe-kit',
            label: 'Axe Kit',
            items: [
              {
                kind: 'grant' as const,
                target: { source: 'equipment' as const, equipmentSlug: 'battleaxe' },
                quantity: 1,
              },
            ],
            wealth: { gp: 0 },
          },
        ],
      },
    },
  }
  const context = createEquipmentStepContextFixture({
    catalog: {
      ...equipmentStepCatalogFixture,
      species: [species],
      classes: [kitClass],
    },
  })
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  function prepared(
    equipmentSelections: {
      equipmentId: string
      quantity: number
      origin: 'manual'
    }[],
  ) {
    return prepareQuickNpcAuthoringCreate({
      createContext: quickNpcStandaloneCreateContext(),
      setup: quickNpcStandaloneSetupValues({
        speciesId: species.id,
        classId: kitClass.id,
        level: 1,
      }),
      tabValues: {
        ...quickNpcAuthoringTabDefaultValues,
        gender: 'female',
        name: 'Scout',
        alignment: 'ln',
        equipmentSelections,
      },
      buildContext: context,
    })
  }

  function packageSelection(draft: { choiceSelections: Record<string, readonly string[]> }) {
    return draft.choiceSelections[startingEquipmentChoiceSetId(kitClass.id)]
  }

  function spearOption(): QuickNpcAdditionalEquipmentOption {
    return {
      option: { value: equipmentStepSpearFixture.id, label: equipmentStepSpearFixture.name },
      pickerItem: {
        equipment: equipmentStepSpearFixture,
        state: {
          isAvailable: true,
          isRecommended: false,
          disabledReasons: [],
          isProficient: true,
          isWithinRemainingBudget: true,
          purchaseAvailability: { status: 'available' },
          recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        },
      },
      row: buildEquipmentPickerRowViewModel(equipmentStepSpearFixture),
    }
  }

  it('keeps the resolved package when adding an unowned kit weapon or another package spear', () => {
    const baseline = prepared([])
    const packageId = packageSelection(baseline.draft)
    expect(packageId).toEqual(['spear-kit'])

    const unowned = projectQuickNpcEquipmentAllocations({
      catalogIndex,
      classed: true,
      equipmentSelections: [
        { equipmentId: equipmentStepBattleaxeFixture.id, quantity: 1, origin: 'manual' },
      ],
    })
    const extraSpear = projectQuickNpcEquipmentAllocations({
      catalogIndex,
      classed: true,
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
      ],
    })
    expect(unowned.requiredWeaponIds).toEqual([])
    expect(unowned.startingEquipmentGrants).toEqual([
      { equipmentId: equipmentStepBattleaxeFixture.id, quantity: 1 },
    ])
    expect(extraSpear.requiredWeaponIds).toEqual([])
    expect(extraSpear.startingEquipmentGrants).toEqual([
      { equipmentId: equipmentStepSpearFixture.id, quantity: 1 },
    ])

    const withAxe = prepared([
      { equipmentId: equipmentStepBattleaxeFixture.id, quantity: 1, origin: 'manual' },
    ])
    const withSpear = prepared([
      { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
    ])
    expect(packageSelection(withAxe.draft)).toEqual(packageId)
    expect(packageSelection(withSpear.draft)).toEqual(packageId)
    expect(
      ownedQuantity(
        deriveEquipmentDraftEntries(withAxe.draft, catalogIndex),
        equipmentStepBattleaxeFixture.id,
      ),
    ).toBe(1)
    expect(
      ownedQuantity(
        deriveEquipmentDraftEntries(withSpear.draft, catalogIndex),
        equipmentStepSpearFixture.id,
      ),
    ).toBe(2)

    const choices = {
      contributions: [],
      removedOverrideIds: [],
      draft: baseline.draft,
      resolvedChoiceSets: baseline.resolvedChoiceSets,
    } as NpcStartingChoices
    const displayed = presentQuickNpcEquipmentOption({
      entry: spearOption(),
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
      ],
      choices,
      catalogIndex,
      classId: kitClass.id,
      supplyCatalog: catalogIndex,
    })
    expect(displayed.trailingState?.label).toBe('×2')
    expect(displayed.disabled).toBe(false)

    const second = projectQuickNpcEquipmentAllocations({
      catalogIndex,
      classed: true,
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 2, origin: 'manual' },
      ],
    })
    expect(second.startingEquipmentGrants).toEqual([
      { equipmentId: equipmentStepSpearFixture.id, quantity: 2 },
    ])
    const reopened = presentQuickNpcEquipmentOption({
      entry: spearOption(),
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 2, origin: 'manual' },
      ],
      choices,
      catalogIndex,
      classId: kitClass.id,
      supplyCatalog: catalogIndex,
    })
    expect(reopened.trailingState?.label).toBe('×3')
    expect(reopened.disabled).toBe(false)
    const grantedAgain = prepared([
      { equipmentId: equipmentStepSpearFixture.id, quantity: 2, origin: 'manual' },
    ])
    expect(packageSelection(grantedAgain.draft)).toEqual(packageId)
    expect(
      ownedQuantity(
        deriveEquipmentDraftEntries(grantedAgain.draft, catalogIndex),
        equipmentStepSpearFixture.id,
      ),
    ).toBe(3)
  })
})
