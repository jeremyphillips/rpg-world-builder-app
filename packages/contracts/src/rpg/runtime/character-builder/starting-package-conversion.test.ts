import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../content/equipment'
import type { ClassStored } from '../../content/classes/class'
import { buildChoiceSetId } from './choice-set'
import { indexCharacterBuildCatalog } from './context'
import { createEmptyCharacterBuilderDraft } from './draft'
import {
  buildStartingPackageConversionPatch,
  buildStartingPackageConversionPreview,
  canConvertStartingPackageToGold,
  purchaseUnitsForGrant,
  resolveGoldStartingEquipmentAlternative,
} from './starting-package-conversion'
import {
  nestedStartingEquipmentChoiceSetId,
  startingEquipmentChoiceSetId,
} from './resolvers/equipment/resolve-starting-equipment-choice-sets'
import { isStartingGoldOption } from '../../content/starting-equipment'
import { resolveStartingEquipmentFundingOptions } from './resolvers/equipment/resolve-starting-equipment-funding'
import type { CharacterBuilderDraft } from './draft'

const RULESET = 'srd-cc-5.2.1' as const

const spear = equipmentSchema.parse({
  id: `${RULESET}:spear`,
  slug: 'spear',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Spear',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 6 } },
  damageType: 'piercing',
  properties: [],
  mastery: 'sap',
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

const explorersPack = equipmentSchema.parse({
  id: `${RULESET}:explorers-pack`,
  slug: 'explorers-pack',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: "Explorer's Pack",
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 59, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'container',
})

const lute = equipmentSchema.parse({
  id: `${RULESET}:lute`,
  slug: 'lute',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lute',
  description: '',
  cost: { amount: 35, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play a tune', dc: 10 }],
})

const arrows = equipmentSchema.parse({
  id: `${RULESET}:arrows`,
  slug: 'arrows',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Arrows',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'ammunition',
  bundleSize: 20,
})

const torch = equipmentSchema.parse({
  id: `${RULESET}:torch`,
  slug: 'torch',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Torch',
  description: '',
  cost: { amount: 1, currency: 'cp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
  bundleSize: 1,
})

const freeToken = equipmentSchema.parse({
  ...spear,
  id: `${RULESET}:free-token`,
  slug: 'free-token',
  name: 'Free Token',
  cost: { amount: 0, currency: 'gp' },
})

const monkClass: ClassStored = {
  id: `${RULESET}:monk`,
  slug: 'monk',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Monk',
  primaryAbilities: ['dex', 'wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['str', 'dex'],
    armor: { categories: [], items: [] },
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
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'spear' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 5,
            },
            {
              kind: 'grant',
              target: { source: 'proficiency_choice', choiceId: 'class-tools' },
              quantity: 1,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'explorers-pack' },
              quantity: 1,
            },
          ],
          wealth: { gp: 11 },
        },
        {
          id: 'gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: "Artisan's Tools or Musical Instrument",
            choose: 1,
            pool: {
              source: 'filtered',
              toolCategories: ['artisan', 'musical_instrument'],
            },
          },
        ],
      },
    },
  },
}

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [monkClass],
  spells: [],
  equipment: [spear, dagger, explorersPack, lute, arrows, torch, freeToken],
  skillProficiencies: [],
  languages: [],
})

const monkToolChoiceSetId = buildChoiceSetId('class', monkClass.id, 'class-tools')

function goldTargetFunding(draft: CharacterBuilderDraft) {
  const goldOption =
    monkClass.characterCreation!.startingEquipment!.options.find(isStartingGoldOption)!
  return resolveStartingEquipmentFundingOptions({ draft, catalogIndex }).get(goldOption.id)!
}

function monkStandardDraft(extra?: Partial<ReturnType<typeof createEmptyCharacterBuilderDraft>>) {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: monkClass.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(monkClass.id)]: ['standard'],
      [monkToolChoiceSetId]: [lute.id],
      ...extra?.choiceSelections,
    },
    equipment: {
      mode: 'package' as const,
      purchases: [],
      removedPackageItemKeys: [],
      customized: false,
      ...extra?.equipment,
    },
    ...extra,
  }
}

function allPackageItemKeys(
  preview: NonNullable<ReturnType<typeof buildStartingPackageConversionPreview>>,
) {
  return new Set(preview.items.map((item) => item.packageItemKey))
}

describe('purchaseUnitsForGrant', () => {
  it('maps ammunition grant units to bundle purchase units', () => {
    expect(purchaseUnitsForGrant(arrows, 20)).toBe(1)
    expect(purchaseUnitsForGrant(arrows, 5)).toBe(1)
    expect(purchaseUnitsForGrant(arrows, 40)).toBe(2)
  })

  it('passes through non-bundle quantities', () => {
    expect(purchaseUnitsForGrant(dagger, 5)).toBe(5)
    expect(purchaseUnitsForGrant(torch, 3)).toBe(3)
  })
})

describe('resolveGoldStartingEquipmentAlternative', () => {
  it('finds the gold option by convention id', () => {
    expect(
      resolveGoldStartingEquipmentAlternative(
        monkClass.characterCreation!.startingEquipment!.options,
      ),
    ).toEqual({
      status: 'available',
      option: monkClass.characterCreation!.startingEquipment!.options[1],
    })
  })
})

describe('buildStartingPackageConversionPreview', () => {
  it('reflects live purchase spend in remaining budget', () => {
    const draft = monkStandardDraft({
      equipment: {
        mode: 'package',
        purchases: [{ equipmentId: torch.id, quantity: 2, sourceMode: 'startingGold' }],
        removedPackageItemKeys: [],
        customized: false,
      },
    })

    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: allPackageItemKeys(
        buildStartingPackageConversionPreview({
          draft,
          catalogIndex,
          departingOptionId: 'standard',
          targetFunding: goldTargetFunding(draft),
          selectedPackageItemKeys: new Set(),
        })!,
      ),
    })

    expect(preview?.budget.existingPurchaseCostCp).toBe(2)
    expect(preview?.budget.startingCp).toBe(5000)
  })

  it('blocks unresolved linked proficiency grants', () => {
    const draft = monkStandardDraft({
      choiceSelections: {
        [startingEquipmentChoiceSetId(monkClass.id)]: ['standard'],
      },
    })

    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: new Set(),
    })

    const linked = preview?.items.find(
      (item) => item.packageItemKey === `${monkClass.id}:standard:2`,
    )
    expect(linked?.status).toBe('blocked')
    expect(linked?.blockingIssue).toMatch(/proficiency/i)
  })

  it('treats free items as zero-cost conversion lines', () => {
    const classWithFreeGrant: ClassStored = {
      ...monkClass,
      characterCreation: {
        ...monkClass.characterCreation!,
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'free-token' },
                  quantity: 1,
                },
              ],
            },
            {
              id: 'gold',
              label: 'Starting Gold',
              items: [],
              wealth: { gp: 10 },
            },
          ],
        },
      },
    }

    const index = indexCharacterBuildCatalog({
      species: [],
      classes: [classWithFreeGrant],
      spells: [],
      equipment: [freeToken],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: classWithFreeGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(classWithFreeGrant.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex: index,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: new Set([`${classWithFreeGrant.id}:standard:0`]),
    })

    expect(preview?.items[0]?.pricing).toEqual({ status: 'free', unitCostCp: 0 })
    expect(preview?.budget.selectedConversionCostCp).toBe(0)
  })
})

describe('canConvertStartingPackageToGold', () => {
  it('rejects over-budget selections', () => {
    const draft = monkStandardDraft()
    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: allPackageItemKeys(
        buildStartingPackageConversionPreview({
          draft,
          catalogIndex,
          departingOptionId: 'standard',
          targetFunding: goldTargetFunding(draft),
          selectedPackageItemKeys: new Set(),
        })!,
      ),
    })!

    expect(preview.budget.remainingCp).toBeLessThan(0)
    expect(
      canConvertStartingPackageToGold({
        preview,
        selectedPackageItemKeys: allPackageItemKeys(preview),
      }),
    ).toBe(false)
  })
})

describe('buildStartingPackageConversionPatch', () => {
  it('prunes nested standard choice keys and switches to gold', () => {
    const draft = monkStandardDraft({
      choiceSelections: {
        [startingEquipmentChoiceSetId(monkClass.id)]: ['standard'],
        [monkToolChoiceSetId]: [lute.id],
        [nestedStartingEquipmentChoiceSetId(monkClass.id, 'standard', 99)]: ['orphan'],
      },
    })

    const preview = buildStartingPackageConversionPreview({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: new Set([
        `${monkClass.id}:standard:0`,
        `${monkClass.id}:standard:3`,
      ]),
    })!

    const patch = buildStartingPackageConversionPatch({
      draft,
      catalogIndex,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: new Set([
        `${monkClass.id}:standard:0`,
        `${monkClass.id}:standard:3`,
      ]),
    })

    expect(patch?.choiceSelections?.[startingEquipmentChoiceSetId(monkClass.id)]).toEqual(['gold'])
    expect(
      patch?.choiceSelections?.[nestedStartingEquipmentChoiceSetId(monkClass.id, 'standard', 99)],
    ).toBeUndefined()
    expect(patch?.choiceSelections?.[monkToolChoiceSetId]).toEqual([lute.id])
    expect(patch?.equipment?.mode).toBe('gold')
    expect(patch?.equipment?.removedPackageItemKeys).toEqual([])
    expect(patch?.equipment?.customized).toBe(true)
    expect(
      canConvertStartingPackageToGold({
        preview,
        selectedPackageItemKeys: new Set([
          `${monkClass.id}:standard:0`,
          `${monkClass.id}:standard:3`,
        ]),
      }),
    ).toBe(true)
  })

  it('merges same-origin stackable purchases at conversion commit', () => {
    const classWithTorchGrant: ClassStored = {
      ...monkClass,
      characterCreation: {
        ...monkClass.characterCreation!,
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'torch' },
                  quantity: 2,
                },
              ],
            },
            {
              id: 'gold',
              label: 'Starting Gold',
              items: [],
              wealth: { gp: 100 },
            },
          ],
        },
      },
    }

    const index = indexCharacterBuildCatalog({
      species: [],
      classes: [classWithTorchGrant],
      spells: [],
      equipment: [torch],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: classWithTorchGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(classWithTorchGrant.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            id: 'converted-torch',
            equipmentId: torch.id,
            quantity: 3,
            sourceMode: 'startingGold' as const,
            origin: 'packageConversion' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const patch = buildStartingPackageConversionPatch({
      draft,
      catalogIndex: index,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(draft),
      selectedPackageItemKeys: new Set([`${classWithTorchGrant.id}:standard:0`]),
    })

    expect(patch?.equipment?.purchases).toHaveLength(1)
    expect(patch?.equipment?.purchases?.[0]).toMatchObject({
      equipmentId: torch.id,
      quantity: 5,
      origin: 'packageConversion',
    })
  })

  it('does not merge cross-origin purchases', () => {
    const draft = monkStandardDraft({
      equipment: {
        mode: 'package',
        purchases: [
          {
            id: 'picker-arrows',
            equipmentId: arrows.id,
            quantity: 3,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    })

    const classWithArrowGrant: ClassStored = {
      ...monkClass,
      characterCreation: {
        ...monkClass.characterCreation!,
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'arrows' },
                  quantity: 20,
                },
              ],
            },
            {
              id: 'gold',
              label: 'Starting Gold',
              items: [],
              wealth: { gp: 100 },
            },
          ],
        },
      },
    }

    const index = indexCharacterBuildCatalog({
      species: [],
      classes: [classWithArrowGrant],
      spells: [],
      equipment: [arrows],
      skillProficiencies: [],
      languages: [],
    })

    const arrowDraft = {
      ...draft,
      class: { classId: classWithArrowGrant.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(classWithArrowGrant.id)]: ['standard'],
      },
    }

    const patch = buildStartingPackageConversionPatch({
      draft: arrowDraft,
      catalogIndex: index,
      departingOptionId: 'standard',
      targetFunding: goldTargetFunding(arrowDraft),
      selectedPackageItemKeys: new Set([`${classWithArrowGrant.id}:standard:0`]),
    })

    expect(patch?.equipment?.purchases).toHaveLength(2)
    expect(patch?.equipment?.purchases?.map((purchase) => purchase.origin).sort()).toEqual([
      'packageConversion',
      'picker',
    ])
  })
})
