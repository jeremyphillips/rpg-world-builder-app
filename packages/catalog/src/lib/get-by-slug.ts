import type { SystemRulesetId } from '@rpg/contracts'

export function getBySlug<T extends { slug: string }>(
  load: (rulesetId: SystemRulesetId) => readonly T[],
  rulesetId: SystemRulesetId,
  slug: string,
  label: string,
): T {
  const found = load(rulesetId).find((item) => item.slug === slug)
  if (!found) {
    throw new Error(`${label} not found: ${rulesetId}:${slug}`)
  }
  return found
}
