import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'
import { classifySelectionSourceMechanic } from '../resolvers/proficiency/selection-source-mechanic'

export type FixedGrantStreamCategory = 'skill' | 'tool' | 'language' | 'equipment'

export type FixedGrantStreamRow = {
  valueId: string
  quantity?: number
  sources?: readonly CharacterSelectionSource[]
}

export type FixedGrantValueStream = {
  category: FixedGrantStreamCategory
  rows: readonly FixedGrantStreamRow[]
}

export type FixedGrantPair = {
  category: FixedGrantStreamCategory
  valueId: string
  quantity?: number
  source: CharacterSelectionSource
}

export type FixedGrantGroup = {
  category: FixedGrantStreamCategory
  source: CharacterSelectionSource
  values: { valueId: string; quantity?: number }[]
}

function sourceIdentity(source: CharacterSelectionSource): string {
  return `${source.kind}:${source.sourceId ?? ''}:${source.grantId ?? ''}`
}

/** Flattens assembled rows to fixed-grant pairs and drops choice-derived sources. */
export function collectFixedGrantPairs(
  streams: readonly FixedGrantValueStream[],
  resolvedChoiceSetIds: ReadonlySet<string>,
): FixedGrantPair[] {
  const pairs: FixedGrantPair[] = []

  for (const stream of streams) {
    for (const row of stream.rows) {
      for (const source of row.sources ?? []) {
        if (classifySelectionSourceMechanic(source, resolvedChoiceSetIds) !== 'fixed-grant') {
          continue
        }
        pairs.push({
          category: stream.category,
          valueId: row.valueId,
          ...(row.quantity !== undefined ? { quantity: row.quantity } : {}),
          source,
        })
      }
    }
  }

  return pairs
}

/** Groups pairs by category and source identity. A value with two sources appears twice. */
export function groupFixedGrantPairs(pairs: readonly FixedGrantPair[]): FixedGrantGroup[] {
  const groups = new Map<string, FixedGrantGroup>()
  const order: string[] = []

  for (const pair of pairs) {
    const key = `${pair.category}:${sourceIdentity(pair.source)}`
    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, {
        category: pair.category,
        source: pair.source,
        values: [{ valueId: pair.valueId, quantity: pair.quantity }],
      })
      order.push(key)
      continue
    }
    if (existing.values.some((value) => value.valueId === pair.valueId)) continue
    existing.values.push({ valueId: pair.valueId, quantity: pair.quantity })
  }

  return order.flatMap((key) => {
    const group = groups.get(key)
    return group ? [group] : []
  })
}
