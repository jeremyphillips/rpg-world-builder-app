import { multiattackPositiveInt } from '@rpg/contracts'

/** Whether the use-step Times disclosure should render open (not including mount writes). */
export function multiattackRepetitionDisclosureOpen(count: unknown): boolean {
  if (count === undefined || count === null || count === '') return false
  const parsed = multiattackPositiveInt(count)
  if (parsed === 1) return false
  return true
}
