import { getAbilityLabel, type Ability } from '../../vocab/ability'

import { findAbilityAssignedToScore } from './ability-generation'
import { pluralizeTermLabel } from '../../vocab/types'

import { characterBuilderAbilityRecommendationMessages } from './ability-score-recommendation-messages'

function capitalizeLabel(label: string): string {
  if (label.length === 0) return label
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`
}

// ---------------------------------------------------------------------------
// Ability score recommendations — advisory class-based guidance for the
// Abilities step. Recommendations never affect validation or block Continue.
// ---------------------------------------------------------------------------

export type AbilityScoreRecommendationClassInput = {
  className: string
  primaryAbilities: readonly Ability[]
}

export type AbilityRecommendation = {
  /** primaryAbilities[0] per class entry (MVP: one class) */
  primary: readonly Ability[]
  /** primaryAbilities[1+] per class entry */
  secondary: readonly Ability[]
}

export type AbilityScoreRecommendation = AbilityRecommendation & {
  /** Present when a score source array is provided */
  suggestedAssignment?: Partial<Record<Ability, number>>
}

function deriveAbilityRecommendation(
  classes: readonly AbilityScoreRecommendationClassInput[],
): AbilityRecommendation {
  const primary: Ability[] = []
  const secondary: Ability[] = []

  for (const entry of classes) {
    const [first, ...rest] = entry.primaryAbilities
    if (first) primary.push(first)
    secondary.push(...rest)
  }

  return { primary, secondary }
}

function deriveSuggestedAssignment(
  primaryAbilities: readonly Ability[],
  scoreSource: readonly number[],
): Partial<Record<Ability, number>> | undefined {
  if (primaryAbilities.length === 0 || scoreSource.length === 0) return undefined

  const sortedScores = [...scoreSource].sort((left, right) => right - left)
  const assignment: Partial<Record<Ability, number>> = {}
  const pairCount = Math.min(sortedScores.length, primaryAbilities.length)

  for (let index = 0; index < pairCount; index += 1) {
    const ability = primaryAbilities[index]
    const score = sortedScores[index]
    if (ability !== undefined && score !== undefined) {
      assignment[ability] = score
    }
  }

  return Object.keys(assignment).length > 0 ? assignment : undefined
}

/** Advisory recommendation from selected class(es) and optional fixed score source. */
export function deriveAbilityScoreRecommendations(
  classes: readonly AbilityScoreRecommendationClassInput[],
  scoreSource?: readonly number[],
): AbilityScoreRecommendation | null {
  if (classes.length === 0) return null

  const recommendation = deriveAbilityRecommendation(classes)

  if (!scoreSource || scoreSource.length === 0) {
    return recommendation
  }

  const allPrimaryAbilities = classes.flatMap((entry) => [...entry.primaryAbilities])
  const suggestedAssignment = deriveSuggestedAssignment(allPrimaryAbilities, scoreSource)

  return suggestedAssignment ? { ...recommendation, suggestedAssignment } : recommendation
}

/** Formats the benefit sentence ability list from primaryAbilities (title-case labels). */
export function formatAbilityRecommendationAbilityList(
  primaryAbilities: readonly Ability[],
): string {
  return primaryAbilities.map((ability) => getAbilityLabel(ability)).join(' or ')
}

function benefitVerbForAbilityCount(count: number): 'is' | 'are' {
  return count === 1 ? 'is' : 'are'
}

/** Plural class label for recommendation copy (e.g. Fighter → Fighters). */
export function formatAbilityRecommendationClassNamePlural(className: string): string {
  return capitalizeLabel(pluralizeTermLabel(className))
}

/** Formats the benefit sentence for a single class entry. */
export function formatAbilityRecommendationBenefit(args: {
  className: string
  primaryAbilities: readonly Ability[]
}): string {
  return characterBuilderAbilityRecommendationMessages.benefit({
    classNamePlural: formatAbilityRecommendationClassNamePlural(args.className),
    abilitiesOrList: formatAbilityRecommendationAbilityList(args.primaryAbilities),
    verb: benefitVerbForAbilityCount(args.primaryAbilities.length),
  })
}

/** Formats inline suggested-assignment copy (e.g. "Suggested: 15 → Strength, 14 → Dexterity."). */
export function formatAbilityRecommendationSuggestedInline(
  pairs: readonly string[],
): string | undefined {
  if (pairs.length === 0) return undefined
  return characterBuilderAbilityRecommendationMessages.suggestedInline({
    pairs: pairs.join(', '),
  })
}

/** True when every suggested pair matches current assignments (extra abilities are allowed). */
export function isSuggestedAssignmentSatisfied(
  currentScores: Partial<Record<Ability, number>>,
  suggestedAssignment: Partial<Record<Ability, number>>,
): boolean {
  for (const [ability, suggestedScore] of Object.entries(suggestedAssignment) as [
    Ability,
    number,
  ][]) {
    if (currentScores[ability] !== suggestedScore) {
      return false
    }
  }

  return true
}

/** True when applying the suggestion would overwrite or relocate an existing assignment. */
export function willSuggestedAssignmentReplaceExisting(
  currentScores: Partial<Record<Ability, number>>,
  suggestedAssignment: Partial<Record<Ability, number>>,
): boolean {
  for (const [ability, suggestedScore] of Object.entries(suggestedAssignment) as [
    Ability,
    number,
  ][]) {
    const currentScore = currentScores[ability]
    if (currentScore !== undefined && currentScore !== suggestedScore) {
      return true
    }

    if (findAbilityAssignedToScore(currentScores, suggestedScore, ability) !== undefined) {
      return true
    }
  }

  return false
}

export type SuggestedAssignmentActionState = 'satisfied' | 'unapplied' | 'wouldReplace'

/** Derives recommendation apply action state from current scores and the suggestion. */
export function resolveSuggestedAssignmentActionState(
  currentScores: Partial<Record<Ability, number>>,
  suggestedAssignment: Partial<Record<Ability, number>>,
): SuggestedAssignmentActionState {
  if (isSuggestedAssignmentSatisfied(currentScores, suggestedAssignment)) {
    return 'satisfied'
  }

  if (willSuggestedAssignmentReplaceExisting(currentScores, suggestedAssignment)) {
    return 'wouldReplace'
  }

  return 'unapplied'
}

/**
 * Merges suggested pairs into current scores. Each suggested ability receives its
 * score; displaced scores return to the pool. Abilities outside the suggestion are
 * left unchanged.
 */
export function mergeSuggestedAssignmentIntoScores(
  currentScores: Partial<Record<Ability, number>>,
  suggestedAssignment: Partial<Record<Ability, number>>,
): Partial<Record<Ability, number>> {
  const next = { ...currentScores }

  for (const [ability, suggestedScore] of Object.entries(suggestedAssignment) as [
    Ability,
    number,
  ][]) {
    if (next[ability] === suggestedScore) continue

    const holder = findAbilityAssignedToScore(next, suggestedScore, ability)
    if (holder) {
      delete next[holder]
    }

    next[ability] = suggestedScore
  }

  return next
}
