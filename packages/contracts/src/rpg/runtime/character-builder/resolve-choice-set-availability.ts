import type { ChoiceSet } from './choice-set'
import { resolveChoiceSetRequiredToComplete } from './choice-set'

export const CHOICE_SET_AVAILABILITY_STATES = ['enough', 'limited', 'none'] as const

export type ChoiceSetAvailability = (typeof CHOICE_SET_AVAILABILITY_STATES)[number]

export type ResolvedChoiceSetAvailability = {
  availability: ChoiceSetAvailability
  availableCount: number
  authoredRequiredCount: number
  effectiveRequiredCount: number
}

/** Unique eligible option ids for the whole ChoiceSet pool. */
export function uniqueEligibleOptionIds(choiceSet: ChoiceSet): string[] {
  return [...new Set(choiceSet.options.map((option) => option.id))]
}

/** ChoiceSet-wide availability and relaxed completion quota. */
export function resolveChoiceSetAvailability(choiceSet: ChoiceSet): ResolvedChoiceSetAvailability {
  const authoredRequiredCount = choiceSet.min
  const availableCount = uniqueEligibleOptionIds(choiceSet).length
  const requiredToComplete = resolveChoiceSetRequiredToComplete(choiceSet)

  let availability: ChoiceSetAvailability
  if (availableCount >= authoredRequiredCount) {
    availability = 'enough'
  } else if (availableCount > 0) {
    availability = 'limited'
  } else {
    availability = 'none'
  }

  const effectiveRequiredCount = requiredToComplete
    ? Math.min(authoredRequiredCount, availableCount)
    : 0

  return {
    availability,
    availableCount,
    authoredRequiredCount,
    effectiveRequiredCount,
  }
}

export function isChoiceSetBuilderComplete(
  choiceSet: ChoiceSet,
  selections: readonly string[],
): boolean {
  if (selections.length > choiceSet.max) return false

  const requiredToComplete = resolveChoiceSetRequiredToComplete(choiceSet)
  if (!requiredToComplete) return true

  const { availability, effectiveRequiredCount } = resolveChoiceSetAvailability(choiceSet)
  if (availability === 'none') return true

  return selections.length >= effectiveRequiredCount
}

/** Returns true when every required ChoiceSet is builder-complete for the selection map. */
export function areRequiredChoiceSetsBuilderComplete(
  choiceSets: readonly ChoiceSet[],
  selectionMap: Readonly<Record<string, string[] | readonly string[]>>,
): boolean {
  return choiceSets.every(
    (cs) => !cs.required || isChoiceSetBuilderComplete(cs, selectionMap[cs.id] ?? []),
  )
}

export function formatChoiceSetAvailabilityLead(choiceSet: ChoiceSet): string | undefined {
  const { availability, availableCount } = resolveChoiceSetAvailability(choiceSet)

  if (availability === 'limited') {
    return `Only ${availableCount} eligible ${formatChoiceAvailabilityNoun(choiceSet, availableCount)} ${availableCount === 1 ? 'is' : 'are'} currently available.`
  }

  if (availability === 'none') {
    return `No eligible ${formatChoiceAvailabilityNoun(choiceSet, 2)} are currently available.`
  }

  return undefined
}

export function formatChoiceSetAvailabilityAfterSelection(
  choiceSet: ChoiceSet,
  selections: readonly string[],
): string | undefined {
  const { availability, availableCount } = resolveChoiceSetAvailability(choiceSet)

  if (availability !== 'limited') return undefined
  if (selections.length < availableCount) return undefined

  return `All available ${formatChoiceAvailabilityNoun(choiceSet, availableCount)} have been chosen.`
}

function formatChoiceAvailabilityNoun(choiceSet: ChoiceSet, count: number): string {
  if (choiceSet.choiceType === 'cantrip') {
    return count === 1 ? 'cantrip' : 'cantrips'
  }
  if (choiceSet.choiceType === 'spell') {
    return count === 1 ? 'spell' : 'spells'
  }
  return count === 1 ? 'option' : 'options'
}

/** Required-count lead for feature and proficiency blocks when the authored quota exceeds the pool. */
export function formatChoiceSetRequiredLead(choiceSet: ChoiceSet): string | undefined {
  const { availability, authoredRequiredCount } = resolveChoiceSetAvailability(choiceSet)
  if (availability === 'enough' || availability === 'none') return undefined

  const noun = formatChoiceAvailabilityNoun(choiceSet, authoredRequiredCount)
  return `Choose ${authoredRequiredCount} ${noun}.`
}
