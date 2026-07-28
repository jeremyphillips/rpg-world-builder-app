import { ABILITY_IDS, getAbilityLabel, type Ability } from '../../vocab/ability'

import {
  findAbilityAssignedToScore,
  getAssignedScoreCount,
  getAvailableStandardArrayScores,
} from './ability-generation'
import { pluralizeTermLabel } from '../../vocab/types'

import { characterBuilderAbilityRecommendationMessages } from './ability/ability-score-recommendation-messages'

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

/** Auto-fill strategy for empty ability slots (MVP: class-recommendations only). */
export type AbilityAutoFillStrategy = 'class-recommendations'

export type AbilityScorePoolActionState = 'hidden' | 'auto-fill' | 'clear'

export type AbilityScoreRandomizer = () => number

export type ScoreShuffleFn = (scores: readonly number[]) => number[]

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

/** Ordered ability list: primaryAbilities first (deduped), then remaining ABILITY_IDS. */
export function deriveAbilityAssignmentPriority(primaryAbilities: readonly Ability[]): Ability[] {
  const seen = new Set<Ability>()
  const order: Ability[] = []

  for (const ability of primaryAbilities) {
    if (seen.has(ability)) continue
    seen.add(ability)
    order.push(ability)
  }

  for (const ability of ABILITY_IDS) {
    if (seen.has(ability)) continue
    seen.add(ability)
    order.push(ability)
  }

  return order
}

function zipScoresToAbilitiesInOrder(
  abilities: readonly Ability[],
  scores: readonly number[],
): Partial<Record<Ability, number>> {
  const assignment: Partial<Record<Ability, number>> = {}
  const pairCount = Math.min(scores.length, abilities.length)

  for (let index = 0; index < pairCount; index += 1) {
    const ability = abilities[index]
    const score = scores[index]
    if (ability !== undefined && score !== undefined) {
      assignment[ability] = score
    }
  }

  return assignment
}

function pairScoresToAbilitiesInOrder(
  abilities: readonly Ability[],
  scores: readonly number[],
): Partial<Record<Ability, number>> {
  const sortedScores = [...scores].sort((left, right) => right - left)
  return zipScoresToAbilitiesInOrder(abilities, sortedScores)
}

function removeScoresFromPool(
  pool: readonly number[],
  scoresToRemove: readonly number[],
): number[] {
  const remaining = [...pool]

  for (const score of scoresToRemove) {
    const index = remaining.indexOf(score)
    if (index !== -1) {
      remaining.splice(index, 1)
    }
  }

  return remaining
}

/** Fisher–Yates shuffle for score tokens; injectable randomizer for tests. */
export function shuffleAbilityScores(
  scores: readonly number[],
  random: AbilityScoreRandomizer = Math.random,
): number[] {
  const result = [...scores]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    const swap = result[swapIndex]
    if (current !== undefined && swap !== undefined) {
      result[index] = swap
      result[swapIndex] = current
    }
  }

  return result
}

function deriveSuggestedAssignment(
  primaryAbilities: readonly Ability[],
  scoreSource: readonly number[],
): Partial<Record<Ability, number>> | undefined {
  if (primaryAbilities.length === 0 || scoreSource.length === 0) return undefined

  const assignment = pairScoresToAbilitiesInOrder(primaryAbilities, scoreSource)
  return Object.keys(assignment).length > 0 ? assignment : undefined
}

/** True when unassigned pool scores remain to fill empty abilities. */
export function canAutoFillEmptyAbilities(
  currentScores: Partial<Record<Ability, number>>,
  scoreSource: readonly number[],
): boolean {
  return getAvailableStandardArrayScores(currentScores, scoreSource).length > 0
}

/** Resolves the score-pool header action from assignment progress and class selection. */
export function resolveAbilityScorePoolActionState(
  currentScores: Partial<Record<Ability, number>>,
  hasClass: boolean,
): AbilityScorePoolActionState {
  if (!hasClass) return 'hidden'
  if (getAssignedScoreCount(currentScores) === ABILITY_IDS.length) return 'clear'
  return 'auto-fill'
}

/** Clears every ability assignment so all scores return to the pool. */
export function clearAllAbilityScores(): Partial<Record<Ability, number>> {
  return {}
}

/**
 * Fills only empty ability slots from the available pool. Recommended abilities
 * (primaryAbilities) receive the highest remaining scores in order; other empty
 * abilities receive the rest in shuffled order so repeated fills vary.
 */
export function fillEmptyAbilitiesWithClassRecommendations(
  currentScores: Partial<Record<Ability, number>>,
  scoreSource: readonly number[],
  primaryAbilities: readonly Ability[],
  shuffleScores: ScoreShuffleFn = shuffleAbilityScores,
): Partial<Record<Ability, number>> {
  const available = getAvailableStandardArrayScores(currentScores, scoreSource)
  if (available.length === 0) return currentScores

  const recommendedAbilities = new Set(primaryAbilities)
  const priority = deriveAbilityAssignmentPriority(primaryAbilities)
  const emptyRecommended = priority.filter(
    (ability) => recommendedAbilities.has(ability) && typeof currentScores[ability] !== 'number',
  )
  const emptyNonRecommended = priority.filter(
    (ability) => !recommendedAbilities.has(ability) && typeof currentScores[ability] !== 'number',
  )

  if (emptyRecommended.length === 0 && emptyNonRecommended.length === 0) {
    return currentScores
  }

  const recommendedPatch = pairScoresToAbilitiesInOrder(emptyRecommended, available)
  const recommendedScores = Object.values(recommendedPatch)
  const remainingScores = removeScoresFromPool(available, recommendedScores)
  const shuffledScores = shuffleScores(remainingScores)
  const nonRecommendedPatch = zipScoresToAbilitiesInOrder(emptyNonRecommended, shuffledScores)

  return { ...currentScores, ...recommendedPatch, ...nonRecommendedPatch }
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
