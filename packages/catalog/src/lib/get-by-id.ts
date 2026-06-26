import type { SystemRulesetId } from '@rpg/contracts'

export function getById<T extends { id: string }>(
  items: readonly T[],
  rulesetId: SystemRulesetId,
  setId: string,
  id: string,
  label: string,
): T {
  const found = items.find((item) => item.id === id)
  if (!found) {
    throw new Error(`${label} not found: ${rulesetId}:${setId}:${id}`)
  }
  return found
}
