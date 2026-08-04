import type { ContentUsageBlocker, VocabularyUsageReference } from '@rpg/contracts'
import { isSourceKeyedUsageBlocker } from '@rpg/contracts'

import { contentUsageBlockersToUsageReferences } from './map-content-usage-blockers'
import {
  resolveUsageBlockerSourceKey,
  type ResolvedUsageBlockerSourceKey,
} from './resolve-usage-blocker-source-key'

export type UsageBlockerSourceGroup = {
  sourceKey: ResolvedUsageBlockerSourceKey
  blockers: ContentUsageBlocker[]
  references: VocabularyUsageReference[]
}

/** Groups usage blockers by semantic sourceKey — never by presentation labels. */
export function groupUsageBlockersBySourceKey(
  blockers: readonly ContentUsageBlocker[],
): UsageBlockerSourceGroup[] {
  const groups = new Map<ResolvedUsageBlockerSourceKey, ContentUsageBlocker[]>()

  for (const blocker of blockers) {
    if (!isSourceKeyedUsageBlocker(blocker)) {
      continue
    }

    const sourceKey = resolveUsageBlockerSourceKey(blocker)
    const existing = groups.get(sourceKey) ?? []
    existing.push(blocker)
    groups.set(sourceKey, existing)
  }

  return [...groups.entries()].map(([sourceKey, groupedBlockers]) => ({
    sourceKey,
    blockers: groupedBlockers,
    references: contentUsageBlockersToUsageReferences(groupedBlockers),
  }))
}

export function collectDistinctSourceKeysFromBlockers(
  blockers: readonly ContentUsageBlocker[],
): ResolvedUsageBlockerSourceKey[] {
  return [...new Set(blockers.map((blocker) => resolveUsageBlockerSourceKey(blocker)))]
}

export function collectDistinctSourceKeysFromBlockedTargets<TBlocker>(
  targets: readonly { status: string; blockers?: readonly TBlocker[] }[],
): ResolvedUsageBlockerSourceKey[] {
  const blockers: ContentUsageBlocker[] = []

  for (const target of targets) {
    if (target.status !== 'blocked' || !target.blockers) {
      continue
    }

    for (const blocker of target.blockers) {
      if (isSourceKeyedUsageBlocker(blocker as ContentUsageBlocker)) {
        blockers.push(blocker as ContentUsageBlocker)
      }
    }
  }

  return collectDistinctSourceKeysFromBlockers(blockers)
}
