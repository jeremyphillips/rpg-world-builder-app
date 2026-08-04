import type { UsageBlocker } from './usage-blocker'
import type { UsageBlockerSourceKey } from './usage-blocker-source-key'

export function readUsageBlockerSourceKey(
  blocker: UsageBlocker,
): UsageBlockerSourceKey | undefined {
  if (blocker.kind === 'rule') {
    return blocker.sourceKey
  }

  return blocker.sourceKey
}

export function isUsageReferenceBlocker(blocker: UsageBlocker): boolean {
  return blocker.kind === 'usage' || blocker.kind === 'content'
}

export function isSourceKeyedUsageBlocker(blocker: UsageBlocker): boolean {
  if (blocker.kind === 'usage' || blocker.kind === 'content') {
    return true
  }

  return blocker.kind === 'rule' && blocker.sourceKey != null
}
