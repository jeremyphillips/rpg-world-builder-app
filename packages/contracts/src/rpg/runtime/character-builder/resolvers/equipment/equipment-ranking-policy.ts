import {
  compareActiveRequirement,
  compareContextRelevance,
  compareSourcePriority,
  compareSpecificity,
  compareStrength,
  resolveOptionContextRelevance,
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
 * Equipment browse order composed from shared comparator primitives.
 * Choice membership and alternative packages do not change recommendation strength.
 * Alternative-package membership is only a tie-break after strength and specificity.
 */
export function compareIntentionalEquipmentRanking(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  context?: EquipmentPickerBrowseSortContext,
): number {
  const activeChoice = context?.activeChoice ?? NO_ACTIVE_CHOICE
  const leftResolved = left.state.resolved
  const rightResolved = right.state.resolved
  if (!leftResolved || !rightResolved) return 0

  const resolvedOrder = compareResolvedEquipmentOptions(leftResolved, rightResolved, activeChoice)
  if (resolvedOrder !== 0) return resolvedOrder

  return compareEquipmentCanonical(left, right, context)
}

function compareResolvedEquipmentOptions(
  left: ResolvedEquipmentOption,
  right: ResolvedEquipmentOption,
  activeChoice: ActiveChoiceContext,
): number {
  return (
    firstNonZero([
      compareActiveRequirement(left.requirements, right.requirements),
      eligibilityRank(left, activeChoice) - eligibilityRank(right, activeChoice),
      compareContextRelevanceForOptions(left, right, activeChoice),
      compareStrength(left.recommendation, right.recommendation),
      compareSpecificity(
        bestSignalSpecificity(left.recommendation) ?? 'broad_pool',
        bestSignalSpecificity(right.recommendation) ?? 'broad_pool',
      ),
      compareSourcePriority(
        primarySourceKind(left.recommendation),
        primarySourceKind(right.recommendation),
      ),
      alternativePackageRank(left) - alternativePackageRank(right),
    ]) ?? 0
  )
}

function compareContextRelevanceForOptions(
  left: ResolvedEquipmentOption,
  right: ResolvedEquipmentOption,
  activeChoice: ActiveChoiceContext,
): number {
  if (activeChoice.kind === 'none') return 0
  return compareContextRelevance(
    resolveOptionContextRelevance({
      state: left.state,
      requirements: left.requirements,
      activeChoice,
    }),
    resolveOptionContextRelevance({
      state: right.state,
      requirements: right.requirements,
      activeChoice,
    }),
  )
}

function firstNonZero(values: readonly number[]): number | undefined {
  for (const value of values) {
    if (value !== 0) return value
  }
  return undefined
}

function eligibilityRank(
  resolved: ResolvedEquipmentOption,
  activeChoice: ActiveChoiceContext,
): number {
  return isEligibleForActiveChoice(resolved, activeChoice) ? 0 : 1
}

function isEligibleForActiveChoice(
  resolved: ResolvedEquipmentOption,
  activeChoice: ActiveChoiceContext,
): boolean {
  if (activeChoice.kind !== 'pool' && activeChoice.kind !== 'package') return false
  const choice = resolved.state.choice
  return Boolean(choice?.inOpenPool && choice.choiceSetId === activeChoice.choiceSetId)
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

function alternativePackageRank(resolved: ResolvedEquipmentOption): number {
  return resolved.state.choice?.inAlternativePackage ? 0 : 1
}

export function compareEquipmentCanonical(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  context?: EquipmentPickerBrowseSortContext,
): number {
  if (left.state.isAffordable !== right.state.isAffordable) {
    return left.state.isAffordable ? -1 : 1
  }

  const leftKindRank = getEquipmentRecommendationKindRank(left.equipment)
  const rightKindRank = getEquipmentRecommendationKindRank(right.equipment)
  if (leftKindRank !== rightKindRank) return leftKindRank - rightKindRank

  const preferMartial = context?.preferMartialWeaponBrowseOrder ?? false
  const leftWeaponCategoryRank = getEquipmentWeaponCategoryBrowseRank(left.equipment, preferMartial)
  const rightWeaponCategoryRank = getEquipmentWeaponCategoryBrowseRank(
    right.equipment,
    preferMartial,
  )
  if (leftWeaponCategoryRank !== rightWeaponCategoryRank) {
    return leftWeaponCategoryRank - rightWeaponCategoryRank
  }

  return left.equipment.name.localeCompare(right.equipment.name, undefined, { sensitivity: 'base' })
}
