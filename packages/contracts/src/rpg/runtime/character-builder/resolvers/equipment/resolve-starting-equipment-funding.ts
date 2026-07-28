import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import { canPurchaseEquipment } from '../../../../content/equipment/can-purchase-equipment'
import { resolveStartingWealthTierForBuilder } from '../../../../campaign/rules/starting-wealth'
import {
  isStartingGoldOption,
  type StartingEquipmentOption,
} from '../../../../content/starting-equipment'
import { averageTierBonusGold } from '../../../../primitives/currency-formula'
import {
  copperToWealth,
  moneyToCopper,
  subtractFromWealth,
  wealthToCopper,
} from '../../../../primitives/wealth'
import {
  characterWealthFromGrant,
  type CharacterWealth,
} from '../../../character/equipment-inventory'
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
}

const EMPTY_WEALTH: CharacterWealth = { cp: 0, sp: 0, gp: 0, pp: 0 }

function addWealth(left: CharacterWealth, right: CharacterWealth): CharacterWealth {
  return copperToWealth(wealthToCopper(left) + wealthToCopper(right))
}

type ResolvedTierFunding = {
  tierAdditionalWealth: CharacterWealth
  classOptionPolicy: ClassOptionPolicy
  tierLabel?: string
}

function resolveTierFunding(
  startingWealth: StartingWealthRules | undefined,
  startingLevel: number,
): ResolvedTierFunding {
  if (!startingWealth) {
    return { tierAdditionalWealth: EMPTY_WEALTH, classOptionPolicy: 'included' }
  }

  const tier = resolveStartingWealthTierForBuilder(startingWealth, startingLevel)
  if (!tier) {
    return { tierAdditionalWealth: EMPTY_WEALTH, classOptionPolicy: 'included' }
  }

  const classOptionPolicy: ClassOptionPolicy = tier.includeNormalStartingEquipment
    ? 'included'
    : 'replaced'

  let tierBonusCp = 0
  if (tier.bonusGold) {
    const bonusGp = Math.floor(averageTierBonusGold(tier.bonusGold))
    tierBonusCp = bonusGp * 100
  }

  return {
    tierAdditionalWealth: copperToWealth(tierBonusCp),
    classOptionPolicy,
    tierLabel: tier.label,
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

  for (const option of startingEquipment.options) {
    result.set(option.id, resolveFundingForOption(option, tier))
  }

  return result
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

function sumPurchaseCostCp(
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
  }
}
