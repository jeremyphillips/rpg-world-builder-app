import { multiattackUseClauseHasRepetition } from '@rpg/contracts'

/** Clears repetition only on an explicit action swap to a known Spellcasting row — not on hydration or unresolved ids. */
export function multiattackUseStepShouldClearRepetitionOnActionChange(input: {
  previousActionId: string | undefined
  nextActionId: string | undefined
  nextActionKind: string | undefined
  count: unknown
}): boolean {
  if (!input.nextActionId) return false
  if (input.previousActionId === input.nextActionId) return false
  if (!multiattackUseClauseHasRepetition(input.count)) return false
  return input.nextActionKind === 'spell'
}
