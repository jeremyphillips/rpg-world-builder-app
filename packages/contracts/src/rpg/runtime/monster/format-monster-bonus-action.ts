import {
  BONUS_STANDARD_ACTION_IDS,
  type BonusActionCombination,
} from '../../content/monster/bonus-standard-actions'
import { joinNaturalList } from '../../primitives/prose'
import { getActionVocabularyEntry } from '../../vocab/action/action-vocabulary'
import { formatMonsterStatBlockSubject } from './spell-entry-presentation'

function capitalSubject(monsterName: string): string {
  const subject = formatMonsterStatBlockSubject(monsterName)
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

/** Positive whole feet. A preset ladder is not a limit. */
export function isPositiveWholeFeet(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1
}

/** Leap sentence. Omitted until both distances are positive whole feet. */
export function formatMonsterLeap(args: {
  monsterName: string
  distanceFeet: number | undefined
  movementFeet: number | undefined
}): string | undefined {
  if (!isPositiveWholeFeet(args.distanceFeet) || !isPositiveWholeFeet(args.movementFeet)) {
    return undefined
  }
  return `${capitalSubject(args.monsterName)} jumps up to ${args.distanceFeet} feet by spending ${args.movementFeet} feet of movement.`
}

function leadingRestriction(restriction: string | undefined): string | undefined {
  if (!restriction) return undefined
  const trimmed = restriction.trim().replace(/\.$/, '')
  return trimmed.length > 0 ? trimmed : undefined
}

function orderedStandardLabels(ids: readonly string[]): string[] {
  return BONUS_STANDARD_ACTION_IDS.flatMap((id) => {
    if (!ids.includes(id)) return []
    const label = getActionVocabularyEntry(id)?.label
    return label ? [label] : []
  })
}

function takesClause(
  labels: readonly string[],
  combination: BonusActionCombination | undefined,
): string | undefined {
  if (labels.length === 0) return undefined
  if (labels.length === 1) return `takes the ${labels[0]} action`
  if (!combination) return undefined
  if (combination === 'one') {
    return `takes the ${joinNaturalList(labels, { conjunction: 'or' })} action`
  }
  return `takes the ${joinNaturalList(labels, { conjunction: 'and' })} actions`
}

/**
 * Dash, Disengage, and Hide. One selected action ignores `combination`.
 * Two or more print nothing until the choice is stored.
 */
export function formatMonsterTakeActions(args: {
  monsterName: string
  standardActions: readonly string[] | undefined
  combination?: BonusActionCombination
  restriction?: string
}): string | undefined {
  const clause = takesClause(orderedStandardLabels(args.standardActions ?? []), args.combination)
  if (!clause) return undefined
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const lead = leadingRestriction(args.restriction)
  if (!lead) return `${capitalSubject(args.monsterName)} ${clause}.`
  return `${lead}, ${subject} ${clause}.`
}

/**
 * Self teleport, or self plus an authored creature phrase.
 * An open passenger without a phrase or a distance prints nothing, including no self-only sentence.
 */
export function formatMonsterTeleport(args: {
  monsterName: string
  distanceFeet: number | undefined
  passenger?: { phrase?: string; withinFeet?: number }
}): string | undefined {
  if (!isPositiveWholeFeet(args.distanceFeet)) return undefined
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capital = capitalSubject(args.monsterName)
  if (!args.passenger) {
    return `${capital} teleports up to ${args.distanceFeet} feet to an unoccupied space it can see.`
  }
  const phrase = args.passenger.phrase?.trim()
  if (!phrase || !isPositiveWholeFeet(args.passenger.withinFeet)) return undefined
  return `${capital} teleports itself or ${phrase} within ${args.passenger.withinFeet} feet of itself up to ${args.distanceFeet} feet to an unoccupied space ${subject} can see.`
}
