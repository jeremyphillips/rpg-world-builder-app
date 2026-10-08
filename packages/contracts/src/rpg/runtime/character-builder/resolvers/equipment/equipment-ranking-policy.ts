import type { Equipment } from '../../../../content/equipment'
import {
  compareActiveRequirement,
  compareSourcePriority,
  compareSpecificity,
  compareStrength,
  type ActiveChoiceContext,
  type OptionRecommendation,
  type RecommendationSourceKind,
} from '../../recommendation'
import type { EquipmentPickerBrowseSortContext } from '../picker/equipment-picker-browse-sort-context'
import type { EquipmentPickerItem } from '../picker/equipment-picker-item'
import { getEquipmentRecommendationKindRank } from '../picker/equipment-picker-item-kind-rank'
import { getEquipmentWeaponCategoryBrowseRank } from '../picker/equipment-picker-item-weapon-category-rank'
import type { ResolvedEquipmentOption } from './project-equipment-option-facts'
import { bestSignalSpecificity } from './project-equipment-option-facts'

const NO_ACTIVE_CHOICE: ActiveChoiceContext = { kind: 'none' }

/**
 * Best-match domain order for equipment picker rows.
 * Not-for-sale and proficiency are late keys, and only when the context asks
 * and the rows are comparable. They do not change recommendation strength.
 * Selection, remaining budget, grant consumption, and package choice do not reorder rows.
 */
export function compareIntentionalEquipmentRanking(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  context?: EquipmentPickerBrowseSortContext,
): number {
  const activeChoice = context?.activeChoice ?? NO_ACTIVE_CHOICE
  const leftResolved = resolvedFacts(left)
  const rightResolved = resolvedFacts(right)

  const resolvedOrder = compareResolvedEquipmentFacts(leftResolved, rightResolved, {
    activeChoice,
    activeRequirementIds: context?.activeRequirementIds,
    rankPurchaseAvailability: context?.rankPurchaseAvailability ?? false,
    rankCompatibility: context?.rankCompatibility ?? true,
  })
  if (resolvedOrder !== 0) return resolvedOrder

  return compareEquipmentCanonical(left.equipment, right.equipment, context)
}

function compareResolvedEquipmentFacts(
  left: ResolvedEquipmentOption,
  right: ResolvedEquipmentOption,
  context: {
    activeChoice: ActiveChoiceContext
    activeRequirementIds?: ReadonlySet<string>
    rankPurchaseAvailability: boolean
    rankCompatibility: boolean
  },
): number {
  return (
    firstNonZero([
      compareActiveRequirement(
        activeRequirements(left, context),
        activeRequirements(right, context),
      ),
      compareStrength(left.recommendation, right.recommendation),
      compareSpecificity(
        bestSignalSpecificity(left.recommendation) ?? 'broad_pool',
        bestSignalSpecificity(right.recommendation) ?? 'broad_pool',
      ),
      compareSourcePriority(
        primarySourceKind(left.recommendation),
        primarySourceKind(right.recommendation),
      ),
      context.rankPurchaseAvailability
        ? purchaseAvailabilityRank(left) - purchaseAvailabilityRank(right)
        : 0,
      context.rankCompatibility ? compareProficiency(left, right) : 0,
    ]) ?? 0
  )
}

function activeRequirements(
  resolved: ResolvedEquipmentOption,
  context: {
    activeChoice: ActiveChoiceContext
    activeRequirementIds?: ReadonlySet<string>
  },
) {
  return resolved.requirements.filter((requirement) => {
    if (!requirement.optionSatisfies) return false
    if (context.activeChoice.kind === 'requirement') {
      return requirement.requirementId === context.activeChoice.requirementId
    }
    if (context.activeRequirementIds) {
      return context.activeRequirementIds.has(requirement.requirementId)
    }
    return true
  })
}

function compareProficiency(left: ResolvedEquipmentOption, right: ResolvedEquipmentOption): number {
  const leftProficient = left.state.compatibility?.proficient
  const rightProficient = right.state.compatibility?.proficient
  if (leftProficient === undefined || rightProficient === undefined) return 0
  if (leftProficient === rightProficient) return 0
  return leftProficient ? -1 : 1
}

function purchaseAvailabilityRank(resolved: ResolvedEquipmentOption): number {
  return resolved.purchaseAvailability?.status === 'unavailableForPurchase' ? 1 : 0
}

function resolvedFacts(item: EquipmentPickerItem): ResolvedEquipmentOption {
  const purchaseAvailability = item.state.purchaseAvailability
  if (item.state.resolved) {
    return item.state.resolved.purchaseAvailability
      ? item.state.resolved
      : { ...item.state.resolved, purchaseAvailability }
  }
  return {
    requirements: [],
    recommendation: { strength: 'neutral', signals: [] },
    state: {},
    purchaseAvailability,
  }
}

function firstNonZero(values: readonly number[]): number | undefined {
  for (const value of values) {
    if (value !== 0) return value
  }
  return undefined
}

function primarySourceKind(
  recommendation: OptionRecommendation,
): RecommendationSourceKind | undefined {
  const ranked = [...recommendation.signals].sort((left, right) => {
    const strengthOrder = compareStrength(left.strength, right.strength)
    if (strengthOrder !== 0) return strengthOrder
    const specificityOrder = compareSpecificity(left.specificity, right.specificity)
    if (specificityOrder !== 0) return specificityOrder
    return compareSourcePriority(left.source?.kind, right.source?.kind)
  })
  return ranked[0]?.source?.kind
}

export function compareEquipmentCanonical(
  left: Equipment,
  right: Equipment,
  context?: EquipmentPickerBrowseSortContext,
): number {
  const leftKindRank = getEquipmentRecommendationKindRank(left)
  const rightKindRank = getEquipmentRecommendationKindRank(right)
  if (leftKindRank !== rightKindRank) return leftKindRank - rightKindRank

  const preferMartial = context?.preferMartialWeaponBrowseOrder ?? false
  const leftWeaponCategoryRank = getEquipmentWeaponCategoryBrowseRank(left, preferMartial)
  const rightWeaponCategoryRank = getEquipmentWeaponCategoryBrowseRank(right, preferMartial)
  if (leftWeaponCategoryRank !== rightWeaponCategoryRank) {
    return leftWeaponCategoryRank - rightWeaponCategoryRank
  }

  return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' })
}
