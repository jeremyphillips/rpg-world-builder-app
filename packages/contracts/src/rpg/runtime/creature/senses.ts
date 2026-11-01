import type { ContentGrant } from '../../content/lib/grants'
import type { Sense } from '../../vocab/sense'

// ---------------------------------------------------------------------------
// Merges authored senses with sense grants. The same sense type keeps the
// greater range. Authored senses keep their order; grant-only types follow.
// ---------------------------------------------------------------------------

export function resolveCreatureSenses(input: {
  authored?: readonly Sense[]
  grants?: readonly ContentGrant[]
}): Sense[] {
  const byType = new Map<string, number>()
  const order: string[] = []

  function add(type: string, range: number) {
    const existing = byType.get(type)
    if (existing === undefined) {
      order.push(type)
      byType.set(type, range)
      return
    }
    byType.set(type, Math.max(existing, range))
  }

  for (const sense of input.authored ?? []) add(sense.type, sense.range)
  for (const grant of input.grants ?? []) {
    if (grant.kind === 'sense') add(grant.type, grant.range)
  }

  return order.map((type) => ({ type, range: byType.get(type)! }))
}
