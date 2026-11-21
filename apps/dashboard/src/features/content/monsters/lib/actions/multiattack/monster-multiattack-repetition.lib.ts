import { multiattackUseClauseHasRepetition } from '@rpg/contracts'

/** Whether the use-step Times disclosure should render open (not including mount writes). */
export function multiattackRepetitionDisclosureOpen(count: unknown): boolean {
  return multiattackUseClauseHasRepetition(count)
}
