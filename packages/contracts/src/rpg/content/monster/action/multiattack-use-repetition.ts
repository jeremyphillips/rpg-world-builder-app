import { multiattackPositiveInt } from './multiattack-schemas'

/** Whether a referenced action row may use the Times repetition control on a single use clause. */
export function multiattackUseClauseRepetitionEligible(actionKind: string | undefined): boolean {
  return actionKind !== 'spell'
}

/** True when the use clause stores a repetition count above one or a non-publishable number. */
export function multiattackUseClauseHasRepetition(count: unknown): boolean {
  if (count === undefined || count === null || count === '') return false
  const parsed = multiattackPositiveInt(count)
  if (parsed === 1) return false
  return true
}

/** Invalid stored Spellcasting repetition — keep Times visible for repair. */
export function multiattackUseClauseRepetitionRepairRequired(
  actionKind: string | undefined,
  count: unknown,
): boolean {
  return actionKind === 'spell' && multiattackUseClauseHasRepetition(count)
}

/** Publish gate: Spellcasting use clauses may not repeat. */
export function multiattackUseClauseRepetitionInvalid(
  actionKind: string | undefined,
  count: unknown,
): boolean {
  if (actionKind !== 'spell') return false
  const parsed = multiattackPositiveInt(count)
  return parsed !== undefined && parsed > 1
}
