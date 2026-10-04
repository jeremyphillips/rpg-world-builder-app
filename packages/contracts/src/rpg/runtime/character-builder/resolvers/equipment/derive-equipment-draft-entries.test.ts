import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { standardStartingWealthTableId } from '../../../../campaign/rules/starting-wealth'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import {
  applyEquipmentPurchaseIntent,
  resolveEquipmentAcquisitionBuilderContext,
} from './apply-equipment-intents'
import { declineClassPackage, selectClassPackage } from './class-package-choice'
import {
  deriveEquipmentDraftEntries,
  inventoryQuantityForEquipmentId,
  resolveEffectiveStartingEquipmentPackageItems,
  startingEquipmentPackageItemKey,
} from './derive-equipment-draft-entries'

const RULESET = 'srd-cc-5.2.1' as const

const leatherArmor = equipmentSchema.parse({
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Leather Armor',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  kind: 'armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

const shield = equipmentSchema.parse({
  id: `${RULESET}:shield`,
  slug: 'shield',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Shield',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 6, unit: 'lb' },
  kind: 'armor',
  category: 'shields',
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
})

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
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

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
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
            {
              id: 'leather-armor',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'leather-armor' },
              quantity: 1,
              equipped: true,
            },
            {
              id: 'shield',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'shield' },
              quantity: 1,
              equipped: true,
            },
          ],
          wealth: { gp: 9 },
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

const startingWealth = {
  name: 'Standard',
  scope: { kind: 'standard' as const },
  tiers: [],
}

function makeCatalogIndex() {
  return indexCharacterBuildCatalog({
    species: [],
    classes: [storedDruid],
    spells: [],
    equipment: [leatherArmor, shield, rope],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })
}

describe('startingEquipmentPackageItemKey', () => {
  it('uses classId, optionId, and item index', () => {
    expect(startingEquipmentPackageItemKey(storedDruid.id, 'standard-equipment', 1)).toBe(
      `${storedDruid.id}:standard-equipment:1`,
    )
  })
})

describe('deriveEquipmentDraftEntries', () => {
  it('leaves unresolved picker purchases out of resolved inventory', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: shield.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        editedSincePackageSelection: false,
        classPackage: { state: 'unresolved' as const },
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())
    expect(equipment.armor.map((entry) => entry.equipmentId)).not.toContain(shield.id)
    expect(equipment.weapons.map((entry) => entry.equipmentId)).not.toContain(shield.id)
  })

  it('includes package grants with classStartingEquipment sources', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.armor).toEqual([
      {
        equipmentId: leatherArmor.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: storedDruid.id,
            grantId: 'standard-equipment',
          },
        ],
      },
      {
        equipmentId: shield.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: storedDruid.id,
            grantId: 'standard-equipment',
          },
        ],
      },
    ])
  })

  it('keeps every package item when the draft has no quantity overrides', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: true,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.armor.map((entry) => entry.equipmentId)).toEqual([leatherArmor.id, shield.id])
  })

  it('includes package items when draft mode is stale gold but the selected option is a package', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        editedSincePackageSelection: false,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.armor?.[0]).toMatchObject({
      sources: [{ kind: 'classStartingEquipment' }],
    })
  })

  it('retains package and purchase channels after a purchase intent on the package path', () => {
    const catalogIndex = makeCatalogIndex()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
      },
    }

    const context = resolveEquipmentAcquisitionBuilderContext({
      context: {
        rulesetId: RULESET,
        characterKind: 'pc',
        characterCreationRules: { startingWealth },
        catalog: { equipment: [leatherArmor, shield, rope] },
      },
      catalogIndex,
      startingWealthTableId: standardStartingWealthTableId(RULESET),
    })

    const result = applyEquipmentPurchaseIntent({
      draft,
      context,
      equipment: rope,
      requestedQuantity: 1,
    })

    expect(result.applied).toBe(true)
    expect(result.draft.equipment?.mode).toBe('package')
    expect(result.draft.equipment?.purchases).toEqual([
      expect.objectContaining({
        equipmentId: rope.id,
        quantity: 1,
        sourceMode: 'startingGold',
        origin: 'picker',
      }),
    ])

    const equipment = deriveEquipmentDraftEntries(result.draft, catalogIndex)

    expect(equipment.armor).toHaveLength(2)
    expect(equipment.gear).toEqual([
      {
        equipmentId: rope.id,
        quantity: 1,
        sources: [
          { kind: 'startingGold', sourceId: storedDruid.id, grantId: 'standard-equipment' },
        ],
      },
    ])
  })

  it('preserves purchase quantities in derived equipment entries', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rope.id,
            quantity: 4,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
          {
            equipmentId: shield.id,
            quantity: 1,
            sourceMode: 'manual' as const,
            origin: 'picker' as const,
          },
        ],
        editedSincePackageSelection: true,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.gear).toEqual([
      {
        equipmentId: rope.id,
        quantity: 4,
        sources: [{ kind: 'startingGold', sourceId: storedDruid.id, grantId: 'starting-gold' }],
      },
    ])
    expect(equipment.armor).toEqual([
      {
        equipmentId: shield.id,
        quantity: 1,
        sources: [{ kind: 'manual' }],
      },
    ])
  })

  it('merges package and ensure grant for the same equipment without doubling quantity', () => {
    const longsword = equipmentSchema.parse({
      id: `${RULESET}:longsword`,
      slug: 'longsword',
      rulesetId: RULESET,
      source: 'system',
      status: 'published',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Longsword',
      description: '',
      cost: { amount: 15, currency: 'gp' },
      weight: { value: 3, unit: 'lb' },
      kind: 'weapon',
      category: 'martial',
      mode: 'melee',
      damage: { dice: { count: 1, faces: 8 } },
      damageType: 'slashing',
      properties: [],
      mastery: 'sap',
    })

    const swordClass: ClassStored = {
      ...storedDruid,
      id: `${RULESET}:sword-kit-class`,
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'sword-kit',
              label: 'Sword Kit',
              items: [
                {
                  id: 'longsword',
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'longsword' },
                  quantity: 1,
                },
              ],
              wealth: { gp: 5 },
            },
          ],
        },
      },
    }

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [swordClass],
      spells: [],
      equipment: [longsword],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: swordClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(swordClass.id)]: ['sword-kit'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        grants: [{ equipmentId: longsword.id, quantity: 1 }],
        editedSincePackageSelection: false,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, catalogIndex)

    expect(equipment.weapons).toEqual([
      {
        equipmentId: longsword.id,
        quantity: 1,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: swordClass.id,
            grantId: 'sword-kit',
          },
          { kind: 'grant' },
        ],
      },
    ])
  })

  it('adds an additional grant on top of package quantity', () => {
    const packedClass: ClassStored = {
      ...storedDruid,
      id: `${RULESET}:packed-druid`,
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  id: 'leather-armor',
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'leather-armor' },
                  quantity: 8,
                  equipped: true,
                },
              ],
              wealth: { gp: 0 },
            },
          ],
        },
      },
    }
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [packedClass],
      spells: [],
      equipment: [leatherArmor],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })

    function owned(grantQuantity: number) {
      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: packedClass.id, level: 1 as const },
        choiceSelections: {
          [startingEquipmentChoiceSetId(packedClass.id)]: ['standard-equipment'],
        },
        equipment: {
          mode: 'package' as const,
          purchases: [],
          grants: [
            {
              equipmentId: leatherArmor.id,
              quantity: grantQuantity,
              contribution: 'additional' as const,
            },
          ],
          editedSincePackageSelection: false,
        },
      }
      return inventoryQuantityForEquipmentId(
        deriveEquipmentDraftEntries(draft, catalogIndex),
        leatherArmor.id,
      )
    }

    expect(owned(1)).toBe(9)
    expect(owned(2)).toBe(10)
  })

  it('omits a package entry at quantity 0 and keeps additional grants when declined', () => {
    const catalogIndex = makeCatalogIndex()
    const selected = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
        classPackage: {
          ...selectClassPackage('standard-equipment', 'explicit'),
          overrides: { entryQuantities: { shield: 0 } },
        },
        grants: [{ equipmentId: rope.id, quantity: 2, contribution: 'additional' as const }],
      },
    }

    const reduced = deriveEquipmentDraftEntries(selected, catalogIndex)
    expect(inventoryQuantityForEquipmentId(reduced, shield.id)).toBe(0)
    expect(inventoryQuantityForEquipmentId(reduced, leatherArmor.id)).toBe(1)
    expect(inventoryQuantityForEquipmentId(reduced, rope.id)).toBe(2)

    const declined = deriveEquipmentDraftEntries(
      {
        ...selected,
        equipment: {
          ...selected.equipment,
          classPackage: declineClassPackage(),
        },
      },
      catalogIndex,
    )
    expect(inventoryQuantityForEquipmentId(declined, leatherArmor.id)).toBe(0)
    expect(inventoryQuantityForEquipmentId(declined, rope.id)).toBe(2)
  })

  it('does not assemble purchases while the starting equipment option is unresolved', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      equipment: {
        mode: 'package' as const,
        purchases: [
          {
            equipmentId: leatherArmor.id,
            quantity: 1,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(inventoryQuantityForEquipmentId(equipment, leatherArmor.id)).toBe(0)
  })
})

describe('resolveEffectiveStartingEquipmentPackageItems', () => {
  const option = storedDruid.characterCreation!.startingEquipment!.options[0]!

  function draftWithOverrides(entryQuantities: Record<string, number>) {
    return {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        editedSincePackageSelection: false,
        classPackage: {
          ...selectClassPackage('standard-equipment', 'explicit'),
          overrides: { entryQuantities },
        },
      },
    }
  }

  it('omits an entry overridden to quantity 0 and keeps authored item indexes', () => {
    const items = resolveEffectiveStartingEquipmentPackageItems(
      draftWithOverrides({ 'leather-armor': 0 }),
      storedDruid,
      option,
      makeCatalogIndex(),
    )
    expect(items.map(({ itemIndex, quantity }) => ({ itemIndex, quantity }))).toEqual([
      { itemIndex: 1, quantity: 1 },
    ])
  })

  it('uses the overridden quantity for a partial stack reduction', () => {
    const stacked: ClassStored = {
      ...storedDruid,
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  id: 'rope',
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'rope' },
                  quantity: 8,
                },
              ],
              wealth: { gp: 0 },
            },
          ],
        },
      },
    }
    const items = resolveEffectiveStartingEquipmentPackageItems(
      draftWithOverrides({ rope: 3 }),
      stacked,
      stacked.characterCreation!.startingEquipment!.options[0]!,
      makeCatalogIndex(),
    )
    expect(items.map((entry) => entry.quantity)).toEqual([3])
  })
})
