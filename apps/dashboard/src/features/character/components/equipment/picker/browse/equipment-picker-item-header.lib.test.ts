import { describe, expect, it } from 'vitest'

import {
  buildMagicItemAllowanceId,
  createEmptyCharacterBuilderDraft,
  equipmentSchema,
  getBuilderSelectedStartingLevel,
  indexCharacterBuildCatalog,
  resolveEquipmentAcquisitionActionState,
  resolveMagicItemAcquiredCopyCap,
  resolveMagicItemGrantAllowances,
  resolveMagicItemGrantProgressList,
  resolveStartingWealthTierForBuilder,
  standardStartingWealthTableId,
  startingEquipmentChoiceSetId,
  type CharacterBuilderDraft,
  type StartingWealthRules,
} from '@rpg/contracts'

import { buildEquipmentPickerRowViewModel } from '@/features/content'

import {
  createEquipmentStepContextWithMagicItemGrantsFixture,
  equipmentStepHeroMagicItemWealthFixture,
  equipmentStepMonkClassFixture,
  equipmentStepPotionOfHealingFixture,
} from '../../../../lib/equipment/equipment-step.fixtures'
import { resolveEquipmentAcquisitionContext } from '../../../../lib/equipment/equipment-step.lib'
import { buildEquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  buildEquipmentPickerOwnershipIndex,
  EMPTY_EQUIPMENT_OWNERSHIP,
  getEquipmentOwnership,
} from '../../../../lib/equipment/equipment-ownership-index.lib'
import {
  equipmentAcquisitionBlockerReason,
  formatEquipmentPickerHeaderTrailingLabel,
  resolveEquipmentPickerItemPresentation,
} from './equipment-picker-item-header.lib'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const commonCharm = equipmentSchema.parse({
  id: `${RULESET}:pearl-of-power`,
  slug: 'pearl-of-power',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Pearl of Power',
  description: '',
  cost: { amount: 50, currency: 'gp' },
  kind: 'magic_item',
  rarity: 'common',
  magicItemCategory: 'wondrous_item',
})

const rareAmulet = equipmentSchema.parse({
  id: `${RULESET}:amulet-of-health`,
  slug: 'amulet-of-health',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Amulet of Health',
  description: '',
  cost: null,
  kind: 'magic_item',
  rarity: 'rare',
  magicItemCategory: 'wondrous_item',
})

const rareWealth = {
  name: 'Standard',
  scope: { kind: 'standard' as const },
  tiers: [
    {
      id: 'hero',
      label: 'Hero',
      minLevel: 1,
      maxLevel: 20,
      includeNormalStartingEquipment: true,
      bonusGold: null,
      magicItemGrants: [{ rarity: 'rare' as const, quantity: 1 }],
    },
  ],
}

function draftWithGoldOption(): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepMonkClassFixture.id, level: 1 },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold',
      purchases: [],
      magicItemSelections: [],
      editedSincePackageSelection: false,
    },
  }
}

function magicItemContext(catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>) {
  const context = createEquipmentStepContextWithMagicItemGrantsFixture({
    characterCreationRules: {
      ...createEquipmentStepContextWithMagicItemGrantsFixture().characterCreationRules,
      startingWealth: equipmentStepHeroMagicItemWealthFixture,
    },
  })

  return resolveEquipmentAcquisitionContext({ context, catalogIndex })
}

function presentationFor(args: {
  equipment: typeof equipmentStepPotionOfHealingFixture | typeof rareAmulet
  workflowMode: 'purchase' | 'magic_items'
  draft: CharacterBuilderDraft
  context: ReturnType<typeof resolveEquipmentAcquisitionContext>
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>
  startingWealth?: StartingWealthRules
}) {
  const actionState = resolveEquipmentAcquisitionActionState({
    draft: args.draft,
    context: args.context,
    equipment: args.equipment,
    workflowMode: args.workflowMode,
    requestedQuantity: 1,
  })
  const rowActionVm = buildEquipmentPickerRowActionViewModel(actionState)
  const row = buildEquipmentPickerRowViewModel(args.equipment)
  const ownership = getEquipmentOwnership(
    buildEquipmentPickerOwnershipIndex({
      draft: args.draft,
      catalogIndex: args.catalogIndex,
      options: args.startingWealth ? { startingWealth: args.startingWealth } : {},
    }),
    args.equipment.id,
  )
  const copyCap = resolveMagicItemAcquiredCopyCap({
    equipment: args.equipment,
    acquiredQuantity: ownership.acquiredQuantity,
  })

  const startingLevel = getBuilderSelectedStartingLevel(args.draft)
  const tier = resolveStartingWealthTierForBuilder(args.context.startingWealth, startingLevel)
  const magicItemGrantProgress = tier
    ? resolveMagicItemGrantProgressList({
        allowances: resolveMagicItemGrantAllowances({
          startingWealthTableId: args.context.startingWealthTableId,
          tier,
          requirement: args.context.magicItemRequirement,
        }),
        selections: args.draft.equipment?.magicItemSelections ?? [],
      })
    : []

  return resolveEquipmentPickerItemPresentation({
    equipment: args.equipment,
    row,
    workflowMode: args.workflowMode,
    rowActionVm,
    ownership,
    ...(copyCap ? { copyCap } : {}),
    maxPurchaseQuantity: ownership.editablePurchased.quantity + 1,
    magicItemGrantProgress,
  })
}

function purchaseOwnership(editable: { quantity: number; spendCp: number }) {
  return {
    ...EMPTY_EQUIPMENT_OWNERSHIP,
    editablePurchased: editable,
    totalQuantity: editable.quantity,
    acquiredQuantity: editable.quantity,
  }
}

describe('resolveEquipmentPickerItemPresentation', () => {
  const catalogIndex = indexCharacterBuildCatalog({
    species: [],
    classes: [equipmentStepMonkClassFixture],
    spells: [],
    equipment: [equipmentStepPotionOfHealingFixture, commonCharm],
    skillProficiencies: [],
    organizations: [],
    languages: [],
  })
  const context = magicItemContext(catalogIndex)

  it('shows purchase price and add for purchase-mode magic items', () => {
    const presentation = presentationFor({
      equipment: equipmentStepPotionOfHealingFixture,
      workflowMode: 'purchase',
      draft: draftWithGoldOption(),
      context,
      catalogIndex,
    })

    expect(presentation).toMatchObject({
      priceSlot: { kind: 'price', label: '50 GP' },
      control: { kind: 'add', disabled: false },
      provenance: [],
    })
  })

  it('shows grant choice and add when a common choice is available', () => {
    const presentation = presentationFor({
      equipment: equipmentStepPotionOfHealingFixture,
      workflowMode: 'magic_items',
      draft: draftWithGoldOption(),
      context,
      catalogIndex,
      startingWealth: equipmentStepHeroMagicItemWealthFixture,
    })

    expect(presentation).toMatchObject({
      priceSlot: { kind: 'grantPreview', label: 'Common choice' },
      control: { kind: 'add', disabled: false },
    })
  })

  it('blocks add in magic-items mode once the matching choices are spent', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })

    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [{ allowanceId, equipmentId: commonCharm.id, quantity: 2 }],
      },
    }

    const presentation = presentationFor({
      equipment: equipmentStepPotionOfHealingFixture,
      workflowMode: 'magic_items',
      draft,
      context,
      catalogIndex,
      startingWealth: equipmentStepHeroMagicItemWealthFixture,
    })

    expect(presentation.blockers).toBeUndefined()
    expect(presentation.control).toEqual({
      kind: 'disabled',
      label: 'No common choices',
      tooltip: 'Common choices are already used.',
    })
  })

  it('shows blocked trailing and no add for unowned blocked rows', () => {
    const rareCatalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [equipmentStepMonkClassFixture],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })
    const rareContext = resolveEquipmentAcquisitionContext({
      context: createEquipmentStepContextWithMagicItemGrantsFixture(),
      catalogIndex: rareCatalogIndex,
    })

    const presentation = presentationFor({
      equipment: rareAmulet,
      workflowMode: 'magic_items',
      draft: draftWithGoldOption(),
      context: rareContext,
      catalogIndex: rareCatalogIndex,
    })

    expect(presentation.blockers).toBeUndefined()
    expect(presentation.control).toEqual({ kind: 'disabled', label: 'No rare choices' })
  })

  it('swaps add for release once the single acquired copy fills the cap', () => {
    const rareCatalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [equipmentStepMonkClassFixture],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      organizations: [],
      languages: [],
    })
    const rareContext = resolveEquipmentAcquisitionContext({
      context: createEquipmentStepContextWithMagicItemGrantsFixture({
        characterCreationRules: {
          ...createEquipmentStepContextWithMagicItemGrantsFixture().characterCreationRules,
          startingWealth: rareWealth,
        },
      }),
      catalogIndex: rareCatalogIndex,
    })
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'rare',
    })
    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [{ allowanceId, equipmentId: rareAmulet.id, quantity: 1 }],
      },
    }

    const presentation = presentationFor({
      equipment: rareAmulet,
      workflowMode: 'magic_items',
      draft,
      context: rareContext,
      catalogIndex: rareCatalogIndex,
      startingWealth: rareWealth,
    })

    expect(presentation.blockers).toBeUndefined()
    expect(presentation.control).toEqual({ kind: 'release', allowanceId })
    expect(presentation.provenance).toEqual([])
    expect(presentation.selectionState).toEqual({
      kind: 'owned',
      provenance: [{ kind: 'choice', label: 'Rare choice', quantity: 1 }],
    })
  })

  it('swaps add for the aggregate stepper once an editable purchase exists', () => {
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: equipmentStepPotionOfHealingFixture,
      row: buildEquipmentPickerRowViewModel(equipmentStepPotionOfHealingFixture),
      workflowMode: 'purchase',
      rowActionVm: {
        kind: 'purchase',
        disabled: false,
        availability: { status: 'available' },
      },
      ownership: purchaseOwnership({ quantity: 2, spendCp: 1000 }),
      maxPurchaseQuantity: 5,
    })

    expect(presentation.control).toEqual({ kind: 'stepper', value: 2, max: 5 })
    expect(presentation.provenance).toEqual([])
    expect(presentation.selectionState).toEqual({
      kind: 'owned',
      provenance: [{ kind: 'purchase', label: 'Purchased · 10 GP', quantity: 2 }],
    })
  })

  it('pins the stepper ceiling at the current aggregate when the next copy is blocked', () => {
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: equipmentStepPotionOfHealingFixture,
      row: buildEquipmentPickerRowViewModel(equipmentStepPotionOfHealingFixture),
      workflowMode: 'purchase',
      rowActionVm: {
        kind: 'purchase',
        disabled: true,
        availability: { status: 'unaffordable', shortfallCp: 100 },
      },
      ownership: purchaseOwnership({ quantity: 2, spendCp: 1000 }),
      maxPurchaseQuantity: 5,
    })

    expect(presentation.control).toEqual({ kind: 'stepper', value: 2, max: 2 })
  })

  it('keeps add disabled for unaffordable rows with nothing purchased yet', () => {
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: equipmentStepPotionOfHealingFixture,
      row: buildEquipmentPickerRowViewModel(equipmentStepPotionOfHealingFixture),
      workflowMode: 'purchase',
      rowActionVm: {
        kind: 'purchase',
        disabled: true,
        availability: { status: 'unaffordable', shortfallCp: 100 },
      },
      ownership: EMPTY_EQUIPMENT_OWNERSHIP,
    })

    expect(presentation.control).toEqual({ kind: 'add', disabled: true })
  })

  it('shows a selected package contribution as owned provenance', () => {
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: equipmentStepPotionOfHealingFixture,
      row: buildEquipmentPickerRowViewModel(equipmentStepPotionOfHealingFixture),
      workflowMode: 'purchase',
      rowActionVm: {
        kind: 'purchase',
        disabled: false,
        availability: { status: 'available' },
      },
      ownership: {
        ...EMPTY_EQUIPMENT_OWNERSHIP,
        packageQuantity: 1,
        totalQuantity: 1,
      },
    })

    expect(presentation.selectionState).toEqual({
      kind: 'owned',
      provenance: [{ kind: 'package', label: 'Package', quantity: 1 }],
    })
  })

  it('lists package, converted, and purchased provenance ahead of the control', () => {
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: equipmentStepPotionOfHealingFixture,
      row: buildEquipmentPickerRowViewModel(equipmentStepPotionOfHealingFixture),
      workflowMode: 'magic_items',
      rowActionVm: {
        kind: 'purchase',
        disabled: true,
        availability: { status: 'available' },
      },
      ownership: {
        ...purchaseOwnership({ quantity: 1, spendCp: 5000 }),
        packageQuantity: 2,
        lockedPurchased: { quantity: 1, spendCp: 0 },
        totalQuantity: 4,
      },
    })

    expect(presentation.selectionState).toEqual({
      kind: 'owned',
      provenance: [
        { kind: 'package', label: 'Package ×2', quantity: 2 },
        { kind: 'purchase', label: 'Converted ×1', quantity: 1 },
        { kind: 'purchase', label: 'Purchased · 50 GP', quantity: 1 },
      ],
    })
    expect(presentation.provenance).toEqual([
      {
        kind: 'action',
        key: 'remove-purchase-one',
        label: 'Remove one',
        ariaLabel: 'Remove one purchased copy',
        target: { kind: 'remove_purchase_one' },
      },
    ])
  })
})

describe('equipment picker blocker mapping', () => {
  it.each([
    [{ code: 'no_matching_grant' as const }, 'acquisition_blocked', 'No rare choices'],
    [{ code: 'duplicate_not_allowed' as const }, 'acquisition_blocked', 'Unavailable'],
    [{ code: 'no_market_price' as const }, 'not_purchasable', 'Not for sale'],
    [{ code: 'cannot_afford' as const, shortfallCp: 1 }, 'unaffordable', 'Cannot afford'],
  ])('maps %o to its reason and keeps its copy', (blocker, reason, label) => {
    expect(equipmentAcquisitionBlockerReason(blocker.code)).toBe(reason)
    expect(formatEquipmentPickerHeaderTrailingLabel({ blocker, rarity: 'rare' })).toBe(label)
  })

  it('maps purchase unavailability to unavailable or not purchasable', () => {
    const row = buildEquipmentPickerRowViewModel(equipmentStepPotionOfHealingFixture)
    const blockersFor = (reason: 'unsupported_kind' | 'no_market_price') =>
      resolveEquipmentPickerItemPresentation({
        equipment: equipmentStepPotionOfHealingFixture,
        row,
        workflowMode: 'purchase',
        rowActionVm: {
          kind: 'purchase',
          disabled: true,
          availability: { status: 'unavailableForPurchase', reason },
        },
        ownership: EMPTY_EQUIPMENT_OWNERSHIP,
      }).blockers

    expect(blockersFor('unsupported_kind')).toMatchObject([
      { reason: 'unavailable', label: 'Unavailable here', category: 'availability' },
    ])
    expect(blockersFor('no_market_price')).toBeUndefined()
  })

  it('replaces a not-for-sale badge with the filled-choice action in magic-items mode', () => {
    const unpricedCommon = equipmentSchema.parse({
      ...commonCharm,
      cost: null,
    })
    const unpricedUncommon = equipmentSchema.parse({
      ...unpricedCommon,
      id: `${RULESET}:pearl-of-power-uncommon`,
      slug: 'pearl-of-power-uncommon',
      name: 'Pearl of Power (uncommon)',
      rarity: 'uncommon',
    })
    const filled = (
      rarities: Array<'common' | 'uncommon'>,
    ): NonNullable<
      Parameters<typeof resolveEquipmentPickerItemPresentation>[0]['magicItemGrantProgress']
    > =>
      rarities.map((rarity) => ({
        allowanceId: rarity,
        rarity,
        capacity: 1,
        selected: 1,
        remainingCapacity: 0,
        isFilled: true,
      }))
    const rowActionVm = {
      kind: 'magic_item_grant' as const,
      disabled: true,
      capabilities: {
        canExpand: false,
        canAdd: false,
        canManage: false,
        addBlockedReason: { code: 'no_market_price' as const },
      },
      maxAdditionalQuantity: 1,
      plan: {
        requestedQuantity: 1,
        fulfilledQuantity: 0,
        unfulfilledQuantity: 1,
        grantAllocations: [],
        purchaseQuantity: 0,
        totalCostCp: 0,
        canApplyRequestedQuantity: false,
        blockers: [{ code: 'no_market_price' as const }],
      },
    }

    const commonPresentation = resolveEquipmentPickerItemPresentation({
      equipment: unpricedCommon,
      row: buildEquipmentPickerRowViewModel(unpricedCommon),
      workflowMode: 'magic_items',
      rowActionVm,
      ownership: EMPTY_EQUIPMENT_OWNERSHIP,
      magicItemGrantProgress: filled(['common', 'uncommon']),
    })

    expect(commonPresentation.blockers).toBeUndefined()
    expect(commonPresentation.control).toEqual({
      kind: 'disabled',
      label: 'No common choices',
      tooltip: 'Common and uncommon choices are already used.',
    })

    const uncommonPresentation = resolveEquipmentPickerItemPresentation({
      equipment: unpricedUncommon,
      row: buildEquipmentPickerRowViewModel(unpricedUncommon),
      workflowMode: 'magic_items',
      rowActionVm,
      ownership: EMPTY_EQUIPMENT_OWNERSHIP,
      magicItemGrantProgress: filled(['common', 'uncommon']),
    })

    expect(uncommonPresentation.control).toEqual({
      kind: 'disabled',
      label: 'No uncommon choices',
      tooltip: 'Uncommon choices are already used.',
    })
  })

  it('replaces the not-for-sale badge with a disabled action in purchase mode', () => {
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: rareAmulet,
      row: buildEquipmentPickerRowViewModel(rareAmulet),
      workflowMode: 'purchase',
      rowActionVm: {
        kind: 'purchase',
        disabled: true,
        availability: { status: 'unavailableForPurchase', reason: 'no_market_price' },
      },
      ownership: EMPTY_EQUIPMENT_OWNERSHIP,
    })

    expect(presentation.blockers).toBeUndefined()
    expect(presentation.control).toEqual({ kind: 'disabled', label: 'Not for sale' })
  })

  it('emits an unaffordable blocker only when no price label is shown', () => {
    const unpriced = { ...equipmentStepPotionOfHealingFixture, cost: null }
    const presentation = resolveEquipmentPickerItemPresentation({
      equipment: unpriced,
      row: buildEquipmentPickerRowViewModel(unpriced),
      workflowMode: 'purchase',
      rowActionVm: {
        kind: 'purchase',
        disabled: true,
        availability: { status: 'unaffordable', shortfallCp: 100 },
      },
      ownership: EMPTY_EQUIPMENT_OWNERSHIP,
    })

    expect(presentation.blockers).toMatchObject([
      { key: 'blocker:unaffordable', reason: 'unaffordable', category: 'affordability' },
    ])
  })
})
