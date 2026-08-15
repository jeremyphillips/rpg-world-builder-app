import { ABILITY_IDS, getAbilityLabel, type Ability } from '../../../vocab/ability'
import { resolveStandardArrayAssignment } from '../../../primitives/standard-array'

import {
  findAbilityAssignedToScore,
  getAssignedScoreCount,
  getAvailableStandardArrayScores,
} from './ability-generation'
import { resolveClassAbilityScoreOrder } from './resolve-class-ability-score-order'
import { pluralizeTermLabel } from '../../../vocab/types'

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
  abilityScoreOrder?: readonly Ability[]
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

/**
 * Deterministic full-pool assignment: abilities in class-priority order
 * (primary abilities first, then remaining ABILITY_IDS) receive pool scores in
 * descending order. Same inputs always produce the same assignment — used by
 * automatic build resolution for temporary Level 0 fills.
 */
export function deriveDeterministicAbilityAssignment(
  primaryAbilities: readonly Ability[],
  scorePool: readonly number[],
): Partial<Record<Ability, number>> {
  return pairScoresToAbilitiesInOrder(deriveAbilityAssignmentPriority(primaryAbilities), scorePool)
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
 * Fills only empty ability slots from the available pool, walking the class
 * ability order and assigning the next remaining Standard Array score for each
 * empty ability (multiset subtraction — duplicate score values are supported).
 */
export function fillEmptyAbilitiesWithClassRecommendations(
  currentScores: Partial<Record<Ability, number>>,
  scoreSource: readonly number[],
  abilityScoreOrder: readonly Ability[],
): Partial<Record<Ability, number>> {
  const next = { ...currentScores }

  for (const ability of abilityScoreOrder) {
    if (typeof next[ability] === 'number') continue

    const available = getAvailableStandardArrayScores(next, scoreSource)
    const score = available[0]
    if (score === undefined) break

    next[ability] = score
  }

  return next
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

  const entry = classes[0]
  if (!entry) return recommendation

  const order = resolveClassAbilityScoreOrder({
    abilityScoreOrder: entry.abilityScoreOrder,
    primaryAbilities: entry.primaryAbilities,
  })
  const suggestedAssignment = resolveStandardArrayAssignment({
    standardArray: scoreSource,
    abilityScoreOrder: order,
  })

  return Object.keys(suggestedAssignment).length > 0
    ? { ...recommendation, suggestedAssignment }
    : recommendation
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
