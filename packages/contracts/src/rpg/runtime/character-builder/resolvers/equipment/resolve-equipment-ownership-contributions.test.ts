import { describe, expect, it } from 'vitest'

import { standardStartingWealthTableId } from '../../../../campaign/rules/starting-wealth'
import type { ClassStored } from '../../../../content/classes/class'
import { equipmentSchema } from '../../../../content/equipment'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft, type CharacterBuilderDraft } from '../../draft/draft'
import { buildMagicItemAllowanceId } from '../../equipment/magic-item-selection'
import {
  deriveEquipmentDraftEntries,
  inventoryQuantityForEquipmentId,
} from './derive-equipment-draft-entries'
import {
  resolveEquipmentOwnershipContributions,
  totalOwnershipContributionQuantity,
} from './resolve-equipment-ownership-contributions'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'

const RULESET = 'srd-cc-5.2.1' as const

const baseContentFields = {
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  description: '',
} as const

const rope = equipmentSchema.parse({
  ...baseContentFields,
  id: `${RULESET}:rope`,
  slug: 'rope',
  name: 'Rope',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
})

const shield = equipmentSchema.parse({
  ...baseContentFields,
  id: `${RULESET}:shield`,
  slug: 'shield',
  name: 'Shield',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 6, unit: 'lb' },
  kind: 'armor',
  category: 'shields',
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
})

const eyesOfTheEagle = equipmentSchema.parse({
  ...baseContentFields,
  id: `${RULESET}:eyes-of-the-eagle`,
  slug: 'eyes-of-the-eagle',
  name: 'Eyes of the Eagle',
  cost: { amount: 500, currency: 'gp' },
  weight: { value: 0, unit: 'lb' },
  kind: 'magic_item',
  magicItemKind: 'wondrous_item',
  rarity: 'uncommon',
  attunement: { required: false },
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
              id: 'shield',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'shield' },
              quantity: 1,
            },
          ],
          wealth: { gp: 20 },
        },
      ],
    },
  },
}

const startingWealth = {
  name: 'Standard',
  scope: { kind: 'standard' as const },
  tiers: [
    {
      id: 'tier-1',
      label: 'Level 1',
      minLevel: 1,
      maxLevel: 4,
      includeNormalStartingEquipment: true,
      magicItemGrants: [{ rarity: 'uncommon' as const, quantity: 2 }],
    },
  ],
}

const uncommonAllowanceId = buildMagicItemAllowanceId({
  startingWealthTableId: standardStartingWealthTableId(RULESET),
  tierId: 'tier-1',
  rarity: 'uncommon',
})

function makeCatalogIndex() {
  return indexCharacterBuildCatalog({
    species: [],
    classes: [storedDruid],
    spells: [],
    equipment: [rope, shield, eyesOfTheEagle],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })
}

function draftWithEquipment(
  equipment: NonNullable<CharacterBuilderDraft['equipment']>,
): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: storedDruid.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard-equipment'],
    },
    equipment,
  }
}

const deriveOptions = { startingWealth, rulesetId: RULESET }

function expectContributionsMatchDerivedInventory(draft: CharacterBuilderDraft): void {
  const catalogIndex = makeCatalogIndex()
  const contributions = resolveEquipmentOwnershipContributions(draft, catalogIndex, deriveOptions)
  const inventory = deriveEquipmentDraftEntries(draft, catalogIndex, deriveOptions)

  for (const equipmentId of [rope.id, shield.id, eyesOfTheEagle.id]) {
    expect(totalOwnershipContributionQuantity(contributions.get(equipmentId))).toBe(
      inventoryQuantityForEquipmentId(inventory, equipmentId),
    )
  }
}

describe('resolveEquipmentOwnershipContributions', () => {
  it('splits package, grant, choice, and purchase channels for one equipment id', () => {
    const draft = draftWithEquipment({
      mode: 'package',
      purchases: [
        {
          id: 'purchase-1',
          equipmentId: shield.id,
          quantity: 2,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
      ],
      grants: [{ equipmentId: shield.id, quantity: 1, contribution: 'additional' }],
      magicItemSelections: [],
      editedSincePackageSelection: false,
    })

    const contributions = resolveEquipmentOwnershipContributions(
      draft,
      makeCatalogIndex(),
      deriveOptions,
    )

    expect(contributions.get(shield.id)).toEqual([
      { kind: 'package', quantity: 1 },
      {
        kind: 'purchase',
        purchaseId: 'purchase-1',
        origin: 'picker',
        quantity: 2,
        unitCostCp: 1000,
        editable: true,
      },
      { kind: 'grant', quantity: 1 },
    ])
    expectContributionsMatchDerivedInventory(draft)
  })

  it('emits one magic_choice per allowance with its rarity', () => {
    const draft = draftWithEquipment({
      mode: 'package',
      purchases: [],
      magicItemSelections: [
        { allowanceId: uncommonAllowanceId, equipmentId: eyesOfTheEagle.id, quantity: 1 },
      ],
      editedSincePackageSelection: false,
    })

    const contributions = resolveEquipmentOwnershipContributions(
      draft,
      makeCatalogIndex(),
      deriveOptions,
    )

    expect(contributions.get(eyesOfTheEagle.id)).toEqual([
      {
        kind: 'magic_choice',
        allowanceId: uncommonAllowanceId,
        rarity: 'uncommon',
        requirement: 'exact',
        quantity: 1,
      },
    ])
    expectContributionsMatchDerivedInventory(draft)
  })

  it('keeps starting-gold purchases editable and locks manual rows', () => {
    const draft = draftWithEquipment({
      mode: 'package',
      purchases: [
        {
          id: 'picker-rope',
          equipmentId: rope.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'picker',
        },
        {
          id: 'converted-shield',
          equipmentId: shield.id,
          quantity: 1,
          sourceMode: 'startingGold',
          origin: 'packageConversion',
        },
        {
          id: 'manual-shield',
          equipmentId: shield.id,
          quantity: 1,
          sourceMode: 'manual',
        },
      ],
      magicItemSelections: [],
      editedSincePackageSelection: false,
    })

    const contributions = resolveEquipmentOwnershipContributions(
      draft,
      makeCatalogIndex(),
      deriveOptions,
    )

    expect(contributions.get(rope.id)).toEqual([
      {
        kind: 'purchase',
        purchaseId: 'picker-rope',
        origin: 'picker',
        quantity: 1,
        unitCostCp: 100,
        editable: true,
      },
    ])
    expect(contributions.get(shield.id)).toMatchObject([
      { kind: 'package' },
      { kind: 'purchase', origin: 'packageConversion', editable: true },
      { kind: 'purchase', origin: 'manual', editable: false },
    ])
    expectContributionsMatchDerivedInventory(draft)
  })

  it('reports only the shortfall for an ensure grant the package already covers', () => {
    const covered = draftWithEquipment({
      mode: 'package',
      purchases: [],
      grants: [{ equipmentId: shield.id, quantity: 1, contribution: 'ensure' }],
      magicItemSelections: [],
      editedSincePackageSelection: false,
    })
    const short = draftWithEquipment({
      mode: 'package',
      purchases: [],
      grants: [{ equipmentId: shield.id, quantity: 3, contribution: 'ensure' }],
      magicItemSelections: [],
      editedSincePackageSelection: false,
    })

    const catalogIndex = makeCatalogIndex()
    expect(
      resolveEquipmentOwnershipContributions(covered, catalogIndex, deriveOptions).get(shield.id),
    ).toEqual([{ kind: 'package', quantity: 1 }])
    expect(
      resolveEquipmentOwnershipContributions(short, catalogIndex, deriveOptions).get(shield.id),
    ).toEqual([
      { kind: 'package', quantity: 1 },
      { kind: 'grant', quantity: 2 },
    ])

    expectContributionsMatchDerivedInventory(covered)
    expectContributionsMatchDerivedInventory(short)
  })

  it('omits purchases while the starting equipment option is unresolved', () => {
    const draft: CharacterBuilderDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 },
      equipment: {
        mode: 'package',
        purchases: [
          {
            id: 'pending',
            equipmentId: rope.id,
            quantity: 1,
            sourceMode: 'startingGold',
            origin: 'picker',
          },
        ],
        editedSincePackageSelection: false,
      },
    }

    expect(
      resolveEquipmentOwnershipContributions(draft, makeCatalogIndex(), deriveOptions).get(rope.id),
    ).toBeUndefined()
    expectContributionsMatchDerivedInventory(draft)
  })
})
