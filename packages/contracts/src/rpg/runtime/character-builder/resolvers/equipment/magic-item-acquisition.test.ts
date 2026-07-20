import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { startingWealthTierSchema } from '../../../../campaign/rules/starting-wealth'
import { standardStartingWealthTableId } from '../../../../campaign/rules/starting-wealth'
import { indexCharacterBuildCatalog } from '../../context'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { buildMagicItemAllowanceId } from '../../magic-item-selection'
import {
  applyEquipmentPurchaseIntent,
  applyMagicItemAcquisitionIntent,
  resolveEquipmentAcquisitionBuilderContext,
} from './apply-equipment-intents'
import { deriveEquipmentDraftEntries } from './derive-equipment-draft-entries'
import { reconcileMagicItemSelections } from './reconcile-magic-item-selections'
import {
  resolveEquipmentAcquisitionPlan,
  resolveEquipmentPurchasePlan,
} from './resolve-equipment-acquisition-plan'
import { resolveEquipmentAcquisitionActionState } from './resolve-equipment-acquisition-action-state'
import { resolveEquipmentAcquisitionQuantityBounds } from './resolve-equipment-acquisition-quantity-bounds'
import { resolveEquipmentPurchaseAvailability } from './resolve-equipment-purchase-availability'
import { resolveMagicItemDuplicatePolicy } from './resolve-magic-item-duplicate-policy'
import { resolveMagicItemGrantAllowances } from './resolve-magic-item-grant-allowances'
import {
  readMagicItemSelections,
  resolveMagicItemGrantReadiness,
  resolveMagicItemSelectionIssues,
} from './resolve-magic-item-grant-progress'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'

const RULESET = 'srd-cc-5.2.1' as const
const TABLE_ID = standardStartingWealthTableId(RULESET)

const commonPotion = equipmentSchema.parse({
  id: `${RULESET}:potion-of-healing`,
  slug: 'potion-of-healing',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Potion of Healing',
  description: '',
  cost: { amount: 50, currency: 'gp' },
  kind: 'magic_item',
  rarity: 'common',
  magicItemCategory: 'potion',
})

const rareAmulet = equipmentSchema.parse({
  id: `${RULESET}:amulet-of-health`,
  slug: 'amulet-of-health',
  rulesetId: RULESET,
  source: 'system',
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

const fighterClass = {
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 100 },
        },
      ],
    },
  },
  features: [],
} satisfies ClassStored

const startingWealth = {
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
      magicItemGrants: [{ rarity: 'common' as const, quantity: 1 }],
    },
  ],
}

function builderContext(catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>) {
  return resolveEquipmentAcquisitionBuilderContext({
    context: {
      rulesetId: RULESET,
      characterCreationRules: { startingWealth },
      catalog: { equipment: [commonPotion, rareAmulet, rope] },
    },
    catalogIndex,
    startingWealthTableId: TABLE_ID,
  })
}

function draftWithGoldOption() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: fighterClass.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(fighterClass.id)]: ['starting-gold'],
    },
    equipment: {
      mode: 'gold' as const,
      purchases: [],
      magicItemSelections: [],
      removedPackageItemKeys: [],
      customized: false,
    },
  }
}

describe('magic item acquisition contracts', () => {
  it('rejects duplicate rarity rows in tier schema', () => {
    const result = startingWealthTierSchema.safeParse({
      id: 'hero',
      label: 'Hero',
      minLevel: 1,
      maxLevel: 20,
      magicItemGrants: [
        { rarity: 'common', quantity: 1 },
        { rarity: 'common', quantity: 2 },
      ],
    })

    expect(result.success).toBe(false)
  })

  it('builds stable allowance ids', () => {
    const allowances = resolveMagicItemGrantAllowances({
      startingWealthTableId: TABLE_ID,
      tier: startingWealth.tiers[0]!,
    })

    expect(allowances).toHaveLength(1)
    expect(allowances[0]!.id).toBe(
      buildMagicItemAllowanceId({
        startingWealthTableId: TABLE_ID,
        tierId: 'hero',
        rarity: 'common',
      }),
    )
  })

  it('treats null-cost equipment as unavailable, not unaffordable', () => {
    const availability = resolveEquipmentPurchaseAvailability({
      equipment: rareAmulet,
      budget: undefined,
    })

    expect(availability).toEqual({ status: 'unavailable', reason: 'no_market_price' })
  })

  it('applies duplicate policy for common priced magic items', () => {
    expect(resolveMagicItemDuplicatePolicy(commonPotion)).toBe('multiple')
    expect(resolveMagicItemDuplicatePolicy(rareAmulet)).toBe('single')
  })

  it('allocates grant before purchase in acquisition plan', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [commonPotion, rareAmulet, rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = draftWithGoldOption()
    const context = builderContext(catalogIndex)
    const plan = resolveEquipmentAcquisitionPlan({
      draft,
      context,
      equipment: commonPotion,
      requestedQuantity: 2,
    })

    expect(plan.grantAllocations).toEqual([{ allowanceId: allowancesId(), quantity: 1 }])
    expect(plan.purchaseQuantity).toBe(1)
    expect(plan.canApplyRequestedQuantity).toBe(true)
    expect(plan.blockers).toEqual([])

    function allowancesId() {
      return buildMagicItemAllowanceId({
        startingWealthTableId: TABLE_ID,
        tierId: 'hero',
        rarity: 'common',
      })
    }
  })

  it('no-ops magic item intent when request cannot be fully fulfilled', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [commonPotion],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        purchases: [
          { equipmentId: commonPotion.id, quantity: 1, sourceMode: 'startingGold' as const },
        ],
      },
    }

    const context = builderContext(catalogIndex)
    const result = applyMagicItemAcquisitionIntent({
      draft,
      context,
      equipment: commonPotion,
      requestedQuantity: 5,
    })

    expect(result.applied).toBe(false)
    expect(result.draft).toBe(draft)
    expect(readMagicItemSelections(result.draft)).toEqual([])
  })

  it('purchase intent never writes magic item selections', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = draftWithGoldOption()
    const context = builderContext(catalogIndex)
    const result = applyEquipmentPurchaseIntent({
      draft,
      context,
      equipment: rope,
      requestedQuantity: 1,
    })

    expect(result.applied).toBe(true)
    expect(readMagicItemSelections(result.draft)).toEqual([])
    expect(result.draft.equipment?.purchases).toHaveLength(1)
    expect(result.draft.equipment?.purchases?.[0]?.unitCostCp).toBe(100)
    expect(result.draft.equipment?.mode).toBe('gold')
  })

  it('preserves package mode when purchasing on the standard-equipment path', () => {
    const druidClass: ClassStored = {
      ...fighterClass,
      id: `${RULESET}:druid-package`,
      slug: 'druid-package',
      name: 'Druid',
      characterCreation: {
        startingEquipment: {
          choose: 1,
          options: [
            {
              id: 'standard-equipment',
              label: 'Standard Equipment',
              items: [
                {
                  kind: 'grant',
                  target: { source: 'equipment', equipmentSlug: 'rope' },
                  quantity: 1,
                },
              ],
              wealth: { gp: 50 },
            },
            {
              id: 'starting-gold',
              label: 'Starting Gold',
              items: [],
              wealth: { gp: 100 },
            },
          ],
        },
      },
    }

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [druidClass],
      spells: [],
      equipment: [rope],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: druidClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(druidClass.id)]: ['standard-equipment'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        magicItemSelections: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const context = builderContext(catalogIndex)
    const result = applyEquipmentPurchaseIntent({
      draft,
      context,
      equipment: rope,
      requestedQuantity: 1,
    })

    expect(result.applied).toBe(true)
    expect(result.draft.equipment?.mode).toBe('package')
    expect(result.draft.equipment?.purchases).toHaveLength(1)
  })

  it('reconcile removes only explicit composite keys', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })

    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [
          { allowanceId, equipmentId: commonPotion.id, quantity: 1 },
          {
            allowanceId,
            equipmentId: rareAmulet.id,
            quantity: 1,
          },
        ],
      },
    }

    const next = reconcileMagicItemSelections({
      draft,
      remove: [{ allowanceId, equipmentId: commonPotion.id }],
    })

    expect(readMagicItemSelections(next)).toEqual([
      { allowanceId, equipmentId: rareAmulet.id, quantity: 1 },
    ])
  })

  it('reports selection issues without mutating draft', () => {
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })

    const issues = resolveMagicItemSelectionIssues({
      selections: [{ allowanceId, equipmentId: rareAmulet.id, quantity: 1 }],
      allowances: resolveMagicItemGrantAllowances({
        startingWealthTableId: TABLE_ID,
        tier: startingWealth.tiers[0]!,
      }),
      catalogEquipment: new Map([
        [commonPotion.id, commonPotion],
        [rareAmulet.id, rareAmulet],
      ]),
    })

    expect(issues.some((issue) => issue.code === 'rarity_mismatch')).toBe(true)
  })

  it('finalizes grant entries with startingWealthTier provenance', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [commonPotion],
      skillProficiencies: [],
      languages: [],
    })

    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'common',
    })

    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [{ allowanceId, equipmentId: commonPotion.id, quantity: 1 }],
      },
    }

    const inventory = deriveEquipmentDraftEntries(draft, catalogIndex, {
      startingWealth,
      rulesetId: RULESET,
    })

    expect(inventory.magicItems).toHaveLength(1)
    expect(inventory.magicItems[0]?.sources).toEqual([
      { kind: 'startingWealthTier', sourceId: TABLE_ID, grantId: allowanceId },
    ])
  })

  it('purchase plan does not allocate grants', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [commonPotion],
      skillProficiencies: [],
      languages: [],
    })

    const plan = resolveEquipmentPurchasePlan({
      draft: draftWithGoldOption(),
      context: builderContext(catalogIndex),
      equipment: commonPotion,
      requestedQuantity: 1,
    })

    expect(plan.grantAllocations).toEqual([])
    expect(plan.purchaseQuantity).toBe(1)
  })

  it('readiness stays incomplete for unfilled exact allowances', () => {
    const allowances = resolveMagicItemGrantAllowances({
      startingWealthTableId: TABLE_ID,
      tier: startingWealth.tiers[0]!,
    })

    const readiness = resolveMagicItemGrantReadiness({
      allowances,
      progress: [
        {
          allowanceId: allowances[0]!.id,
          rarity: 'common',
          capacity: 1,
          selected: 0,
          remainingCapacity: 1,
          isFilled: false,
        },
      ],
    })

    expect(readiness.complete).toBe(false)
    expect(readiness.issues[0]?.remaining).toBe(1)
  })

  it('resolves quantity bounds from draft ownership', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [commonPotion, rareAmulet],
      skillProficiencies: [],
      languages: [],
    })
    const context = builderContext(catalogIndex)
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: TABLE_ID,
      tierId: 'hero',
      rarity: 'rare',
    })

    expect(
      resolveEquipmentAcquisitionQuantityBounds({
        equipment: rareAmulet,
        draft: draftWithGoldOption(),
        context,
      }),
    ).toEqual({ maxAdditionalQuantity: 1 })

    const ownedRare = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        magicItemSelections: [{ allowanceId, equipmentId: rareAmulet.id, quantity: 1 }],
      },
    }

    expect(
      resolveEquipmentAcquisitionQuantityBounds({
        equipment: rareAmulet,
        draft: ownedRare,
        context,
      }),
    ).toEqual({ maxAdditionalQuantity: 0 })
  })

  it('enables null-price rare rows in magic-items action state', () => {
    const rareWealth = {
      ...startingWealth,
      tiers: [
        {
          ...startingWealth.tiers[0]!,
          magicItemGrants: [{ rarity: 'rare' as const, quantity: 1 }],
        },
      ],
    }

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      languages: [],
    })
    const context = resolveEquipmentAcquisitionBuilderContext({
      context: {
        rulesetId: RULESET,
        characterCreationRules: { startingWealth: rareWealth },
        catalog: { equipment: [rareAmulet] },
      },
      catalogIndex,
      startingWealthTableId: TABLE_ID,
    })

    const state = resolveEquipmentAcquisitionActionState({
      draft: draftWithGoldOption(),
      context,
      equipment: rareAmulet,
      workflowMode: 'magic_items',
      requestedQuantity: 1,
    })

    expect(state.kind).toBe('magic_item_grant')
    if (state.kind !== 'magic_item_grant') return

    expect(state.capabilities.canExpand).toBe(true)
    expect(state.capabilities.canAdd).toBe(true)
    expect(state.eligibility.eligible).toBe(true)
    if (state.eligibility.eligible) {
      expect(state.eligibility.allowanceId).toContain('rare')
    }
  })

  it('keeps purchase-mode null-price rows unavailable', () => {
    const state = resolveEquipmentAcquisitionActionState({
      draft: draftWithGoldOption(),
      context: builderContext(
        indexCharacterBuildCatalog({
          species: [],
          classes: [fighterClass],
          spells: [],
          equipment: [rareAmulet],
          skillProficiencies: [],
          languages: [],
        }),
      ),
      equipment: rareAmulet,
      workflowMode: 'purchase',
      requestedQuantity: 1,
    })

    expect(state).toEqual({
      kind: 'purchase',
      availability: { status: 'unavailable', reason: 'no_market_price' },
    })
  })

  it('surfaces partialAction for resource-limited mixed allocation', () => {
    const goldSink = equipmentSchema.parse({
      id: `${RULESET}:gold-sink`,
      slug: 'gold-sink',
      rulesetId: RULESET,
      source: 'system',
      campaignId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      name: 'Gold Sink',
      description: '',
      cost: { amount: 50, currency: 'gp' },
      kind: 'adventuring_gear',
      gearKind: 'general',
    })

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [commonPotion, goldSink],
      skillProficiencies: [],
      languages: [],
    })
    const context = builderContext(catalogIndex)

    const draft = {
      ...draftWithGoldOption(),
      equipment: {
        ...draftWithGoldOption().equipment!,
        purchases: [{ equipmentId: goldSink.id, quantity: 1, sourceMode: 'startingGold' as const }],
        magicItemSelections: [],
      },
    }

    const plan = resolveEquipmentAcquisitionPlan({
      draft,
      context,
      equipment: commonPotion,
      requestedQuantity: 3,
    })

    expect(plan.partialAction).toEqual({
      requestedQuantity: 2,
      grantQuantity: 1,
      purchaseQuantity: 1,
      totalCostCp: 5000,
    })
  })

  it('omits partialAction for structural duplicate blocks', () => {
    const rareWealth = {
      ...startingWealth,
      tiers: [
        {
          ...startingWealth.tiers[0]!,
          magicItemGrants: [{ rarity: 'rare' as const, quantity: 1 }],
        },
      ],
    }

    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [fighterClass],
      spells: [],
      equipment: [rareAmulet],
      skillProficiencies: [],
      languages: [],
    })
    const context = resolveEquipmentAcquisitionBuilderContext({
      context: {
        rulesetId: RULESET,
        characterCreationRules: { startingWealth: rareWealth },
        catalog: { equipment: [rareAmulet] },
      },
      catalogIndex,
      startingWealthTableId: TABLE_ID,
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

    const plan = resolveEquipmentAcquisitionPlan({
      draft,
      context,
      equipment: rareAmulet,
      requestedQuantity: 2,
    })

    expect(plan.partialAction).toBeUndefined()
    expect(plan.blockers.some((blocker) => blocker.code === 'duplicate_not_allowed')).toBe(true)
  })
})
