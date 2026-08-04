import {
  isSourceKeyedUsageBlocker,
  readUsageBlockerSourceKey,
  USAGE_BLOCKER_SOURCE_KEYS,
  type ContentUsageBlocker,
  type UsageBlockerSourceKey,
} from '@rpg/contracts'

export type ResolvedUsageBlockerSourceKey = UsageBlockerSourceKey

const warnedMissingSourceKeys = new Set<string>()

export function resolveUsageBlockerSourceKey(
  blocker: ContentUsageBlocker,
): ResolvedUsageBlockerSourceKey {
  const sourceKey = readUsageBlockerSourceKey(blocker)

  if (sourceKey) {
    return sourceKey
  }

  if (import.meta.env.DEV) {
    const warnKey = `${blocker.kind}:${'code' in blocker ? blocker.code : blocker.kind}`
    if (!warnedMissingSourceKeys.has(warnKey)) {
      warnedMissingSourceKeys.add(warnKey)
      console.warn('[usage-blocker-copy] Missing sourceKey on blocker; using unknown fallback.', {
        kind: blocker.kind,
      })
    }
  }

  return USAGE_BLOCKER_SOURCE_KEYS.unknown
}

export function collectDistinctUsageBlockerSourceKeys(
  blockers: readonly ContentUsageBlocker[],
): ResolvedUsageBlockerSourceKey[] {
  const keys = new Set<ResolvedUsageBlockerSourceKey>()

  for (const blocker of blockers) {
    keys.add(resolveUsageBlockerSourceKey(blocker))
  }

  return [...keys]
}

export function collectUsageBlockersFromBlockedTargets<TBlocker>(
  targets: readonly { status: string; blockers?: readonly TBlocker[] }[],
): ContentUsageBlocker[] {
  const blockers: ContentUsageBlocker[] = []

  for (const target of targets) {
    if (target.status !== 'blocked' || !target.blockers) {
      continue
    }

    for (const blocker of target.blockers) {
      if (!isSourceKeyedUsageBlocker(blocker as ContentUsageBlocker)) {
        continue
      }

      blockers.push(blocker as ContentUsageBlocker)
    }
  }

  return blockers
}

export function resetUsageBlockerSourceKeyWarningsForTests(): void {
  warnedMissingSourceKeys.clear()
}
