import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
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
  collectQuickNpcEquipmentSupply,
  listSelectedQuickNpcAdditionalEquipment,
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

describe('package, role, and manual quantities stay partitioned', () => {
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
                quantity: 8,
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
  const partitionedCatalog = indexCharacterBuildCatalog(context.catalog)

  function packageDraft() {
    return {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: kitClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(kitClass.id)]: ['spear-kit'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }
  }

  function choices(): NpcStartingChoices {
    return {
      contributions: [],
      removedOverrideIds: [],
      draft: packageDraft(),
      resolvedChoiceSets: [],
    }
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

  it('keeps package 8, role 1, and manual 2 as separate contributions', () => {
    const supply = collectQuickNpcEquipmentSupply({
      equipmentId: equipmentStepSpearFixture.id,
      equipmentSelections: [
        { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'role-default' },
        { equipmentId: equipmentStepSpearFixture.id, quantity: 2, origin: 'manual' },
      ],
      roleId: 'guard',
      choices: choices(),
      catalogIndex: partitionedCatalog,
      classId: kitClass.id,
    })

    expect(supply.quantity).toBe(11)
    expect(supply.contributions).toEqual([
      { source: { kind: 'role-default', id: 'guard' }, quantity: 1 },
      { source: { kind: 'manual' }, quantity: 2 },
      {
        source: {
          kind: 'recorded',
          source: {
            kind: 'classStartingEquipment',
            sourceId: kitClass.id,
            grantId: 'spear-kit',
          },
        },
        quantity: 8,
      },
    ])
  })

  it('rehydrates package 8 plus a manual grant as ×9, then ×10, without steering the package', () => {
    function prepared(quantity: number) {
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
          equipmentSelections: [
            { equipmentId: equipmentStepSpearFixture.id, quantity, origin: 'manual' },
          ],
        },
        buildContext: context,
      })
    }

    const baseline = packageDraft()
    const packageId = baseline.choiceSelections[startingEquipmentChoiceSetId(kitClass.id)]
    const liveChoices = choices()

    function displayed(quantity: number) {
      return presentQuickNpcEquipmentOption({
        entry: spearOption(),
        equipmentSelections: [
          { equipmentId: equipmentStepSpearFixture.id, quantity, origin: 'manual' },
        ],
        choices: liveChoices,
        catalogIndex: partitionedCatalog,
        classId: kitClass.id,
        supplyCatalog: partitionedCatalog,
      })
    }

    function selected(quantity: number) {
      return listSelectedQuickNpcAdditionalEquipment({
        equipmentSelections: [
          { equipmentId: equipmentStepSpearFixture.id, quantity, origin: 'manual' },
        ],
        additionalOptions: [spearOption()],
        choices: liveChoices,
        catalogIndex: partitionedCatalog,
        classId: kitClass.id,
      })[0]
    }

    expect(displayed(1).trailingState?.label).toBe('×9')
    expect(displayed(1).secondaryTitle).toBe('Monk package ×8')
    expect(displayed(1).secondaryTitle).not.toContain('Added manually')
    expect(selected(1)?.manualQuantity).toBe(1)
    expect(selected(1)?.contextLabel).toBe('9 total · Monk package ×8')

    expect(
      projectQuickNpcEquipmentAllocations({
        catalogIndex: partitionedCatalog,
        classed: true,
        equipmentSelections: [
          { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
        ],
      }),
    ).toMatchObject({
      requiredWeaponIds: [],
      startingEquipmentGrants: [{ equipmentId: equipmentStepSpearFixture.id, quantity: 1 }],
    })

    const first = prepared(1)
    expect(first.draft.choiceSelections[startingEquipmentChoiceSetId(kitClass.id)]).toEqual(
      packageId,
    )
    expect(
      ownedQuantity(
        deriveEquipmentDraftEntries(first.draft, partitionedCatalog),
        equipmentStepSpearFixture.id,
      ),
    ).toBe(9)

    expect(displayed(2).trailingState?.label).toBe('×10')
    expect(selected(2)?.manualQuantity).toBe(2)
    expect(selected(2)?.contextLabel).toBe('10 total · Monk package ×8')

    expect(
      projectQuickNpcEquipmentAllocations({
        catalogIndex: partitionedCatalog,
        classed: true,
        equipmentSelections: [
          { equipmentId: equipmentStepSpearFixture.id, quantity: 2, origin: 'manual' },
        ],
      }).startingEquipmentGrants,
    ).toEqual([{ equipmentId: equipmentStepSpearFixture.id, quantity: 2 }])

    const second = prepared(2)
    expect(second.draft.choiceSelections[startingEquipmentChoiceSetId(kitClass.id)]).toEqual(
      packageId,
    )
    expect(
      ownedQuantity(
        deriveEquipmentDraftEntries(second.draft, partitionedCatalog),
        equipmentStepSpearFixture.id,
      ),
    ).toBe(10)
  })
})
