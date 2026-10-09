import {
  resolveStartingWealthTierForBuilder,
  type StartingWealthRules,
  type StartingWealthTier,
} from '../../../../campaign/rules/starting-wealth'
import { canPurchaseEquipment } from '../../../../content/equipment/can-purchase-equipment'
import {
  isStartingGoldOption,
  type StartingEquipmentOption,
} from '../../../../content/starting-equipment'
import { availableStartingEquipmentOptions } from '../../../../content/starting-equipment-availability'
import { averageTierBonusGold, type TierBonusGold } from '../../../../primitives/currency-formula'
import {
  copperToWealth,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
} from '../../../../primitives/wealth'
import {
  characterWealthFromGrant,
  type CharacterWealth,
} from '../../../character/sheet/equipment-inventory'
import type { CharacterBuildCatalogIndex } from '../../context'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipmentPurchase,
} from '../../draft/draft'
import { getBuilderSelectedStartingLevel } from '../../progression/builder-level'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'
import type { EquipmentBudgetSummary } from './equipment-budget'

export type ClassOptionPolicy = 'included' | 'replaced'

export type ResolvedStartingEquipmentFunding = {
  classOptionId?: string
  classOptionWealth: CharacterWealth
  tierAdditionalWealth: CharacterWealth
  totalStartingWealth: CharacterWealth
  classOptionPolicy: ClassOptionPolicy
  tierLabel?: string
  /** Authored tier formula. Absent when no tier matched. */
  bonusGold?: TierBonusGold | null
}

const EMPTY_WEALTH: CharacterWealth = { cp: 0, sp: 0, gp: 0, pp: 0 }

function addWealth(left: CharacterWealth, right: CharacterWealth): CharacterWealth {
  return copperToWealth(wealthToCopper(left) + wealthToCopper(right))
}

type ResolvedTierFunding = {
  tierAdditionalWealth: CharacterWealth
  classOptionPolicy: ClassOptionPolicy
  tierLabel?: string
  bonusGold?: TierBonusGold | null
}

export type ResolvedStartingEquipmentTierResources = {
  tier: StartingWealthTier
  bonusWealth: CharacterWealth
}

/** Nearest copper. Whole-copper discreteness, not a gold floor. */
function tierBonusGoldToWealth(bonus: TierBonusGold | null | undefined): CharacterWealth {
  if (!bonus) return EMPTY_WEALTH
  return copperToWealth(Math.round(averageTierBonusGold(bonus) * 100))
}

/**
 * Tier for the selected starting level, plus its bonus purse.
 * A zero bonus is still returned so Initiate and magic-only tiers stay visible.
 */
export function resolveStartingEquipmentTierResources(args: {
  startingWealth?: StartingWealthRules
  startingLevel: number
}): ResolvedStartingEquipmentTierResources | undefined {
  if (!args.startingWealth) return undefined

  const tier = resolveStartingWealthTierForBuilder(args.startingWealth, args.startingLevel)
  if (!tier) return undefined

  return {
    tier,
    bonusWealth: tierBonusGoldToWealth(tier.bonusGold),
  }
}

function resolveTierFunding(
  startingWealth: StartingWealthRules | undefined,
  startingLevel: number,
): ResolvedTierFunding {
  const resources = resolveStartingEquipmentTierResources({ startingWealth, startingLevel })
  if (!resources) {
    return { tierAdditionalWealth: EMPTY_WEALTH, classOptionPolicy: 'included' }
  }

  return {
    tierAdditionalWealth: resources.bonusWealth,
    classOptionPolicy: resources.tier.includeNormalStartingEquipment ? 'included' : 'replaced',
    tierLabel: resources.tier.label,
    bonusGold: resources.tier.bonusGold,
  }
}

/** Whether package equipment grants apply for this option under the current tier policy. */
export function includesClassStartingEquipment(
  option: StartingEquipmentOption,
  classOptionPolicy: ClassOptionPolicy,
): boolean {
  return classOptionPolicy === 'included' && !isStartingGoldOption(option)
}

function resolveClassOptionWealth(
  option: StartingEquipmentOption,
  classOptionPolicy: ClassOptionPolicy,
): CharacterWealth {
  if (classOptionPolicy === 'replaced') {
    return EMPTY_WEALTH
  }

  if (isStartingGoldOption(option)) {
    return characterWealthFromGrant(option.wealth!)
  }

  return characterWealthFromGrant(option.wealth)
}

function resolveFundingForOption(
  option: StartingEquipmentOption,
  tier: ResolvedTierFunding,
): ResolvedStartingEquipmentFunding {
  const classOptionWealth = resolveClassOptionWealth(option, tier.classOptionPolicy)

  return {
    ...(tier.classOptionPolicy === 'included' ? { classOptionId: option.id } : {}),
    classOptionWealth,
    tierAdditionalWealth: tier.tierAdditionalWealth,
    totalStartingWealth: addWealth(classOptionWealth, tier.tierAdditionalWealth),
    classOptionPolicy: tier.classOptionPolicy,
    tierLabel: tier.tierLabel,
    bonusGold: tier.bonusGold,
  }
}

/** Resolves tier-aware funding snapshots for every class starting-equipment option. */
export function resolveStartingEquipmentFundingOptions(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  startingWealth?: StartingWealthRules
}): ReadonlyMap<string, ResolvedStartingEquipmentFunding> {
  const classId = args.draft.class.classId
  if (!classId) return new Map()

  const characterClass = args.catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!characterClass || !startingEquipment) return new Map()

  const startingLevel = getBuilderSelectedStartingLevel(args.draft)
  const tier = resolveTierFunding(args.startingWealth, startingLevel)
  const result = new Map<string, ResolvedStartingEquipmentFunding>()

  for (const option of availableStartingEquipmentOptions(startingEquipment.options)) {
    result.set(option.id, resolveFundingForOption(option, tier))
  }

  return result
}

/**
 * Largest starting purse among currently available packages for this build.
 * Each option total is class wealth plus the tier bonus. Spent purchases are
 * not subtracted. Undefined when this build has no funding snapshots.
 */
export function resolvePurchaseBudgetCeilingCp(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  startingWealth?: StartingWealthRules
}): number | undefined {
  const fundingByOptionId = resolveStartingEquipmentFundingOptions(args)
  if (fundingByOptionId.size === 0) return undefined

  let ceilingCp = 0
  for (const funding of fundingByOptionId.values()) {
    ceilingCp = Math.max(ceilingCp, wealthToCopper(funding.totalStartingWealth))
  }
  return ceilingCp
}

/** Resolves funding for the draft's currently selected starting-equipment option. */
export function resolveSelectedStartingEquipmentFunding(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  startingWealth?: StartingWealthRules
}): ResolvedStartingEquipmentFunding | undefined {
  const classId = args.draft.class.classId
  if (!classId) return undefined

  const selectedOptionId = readSelectedStartingEquipmentOptionId(args.draft, classId)
  if (!selectedOptionId) return undefined

  return resolveStartingEquipmentFundingOptions(args).get(selectedOptionId)
}

export function sumPurchaseCostCp(
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  catalogIndex: CharacterBuildCatalogIndex,
): number {
  return purchases.reduce((total, purchase) => {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)
    if (!equipment || !canPurchaseEquipment(equipment)) return total
    return total + moneyToCopper(equipment.cost) * purchase.quantity
  }, 0)
}

/** Derives starting/spent/remaining wealth from a pre-resolved funding snapshot. */
export function deriveEquipmentBudgetSummaryFromFunding(args: {
  funding: ResolvedStartingEquipmentFunding
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[]
  catalogIndex: CharacterBuildCatalogIndex
}): EquipmentBudgetSummary {
  const starting = args.funding.totalStartingWealth
  const spentCp = sumPurchaseCostCp(args.purchases, args.catalogIndex)
  const spent = copperToWealth(spentCp)
  const remaining = subtractFromWealth(starting, spentCp)

  return { starting, spent, remaining }
}

/** Tier-only funding when no class option is selected but a tier bonus applies. */
export function resolveTierOnlyStartingEquipmentFunding(args: {
  draft: CharacterBuilderDraft
  startingWealth?: StartingWealthRules
}): ResolvedStartingEquipmentFunding | undefined {
  const startingLevel = getBuilderSelectedStartingLevel(args.draft)
  const tier = resolveTierFunding(args.startingWealth, startingLevel)

  if (wealthToCopper(tier.tierAdditionalWealth) === 0) {
    return undefined
  }

  return {
    classOptionWealth: EMPTY_WEALTH,
    tierAdditionalWealth: tier.tierAdditionalWealth,
    totalStartingWealth: tier.tierAdditionalWealth,
    classOptionPolicy: tier.classOptionPolicy,
    tierLabel: tier.tierLabel,
    bonusGold: tier.bonusGold,
  }
}
