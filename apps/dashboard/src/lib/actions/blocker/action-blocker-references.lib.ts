import { formatUsageBlockerItemSummary } from '@/lib/usage-references/usage-blocker-copy'
import type { UsageBlockerSourceKey } from '@rpg/contracts'

import {
  usageReferenceFlatListClasses,
  usageReferenceRowListClasses,
} from '@/lib/usage-references/usage-reference-list.lib'

/** Shared chrome for blocker reference summaries in bulk resolution rows. */
export const actionBlockerReferenceSummaryClasses = 'text-style-caption' as const

/** Bulleted lists nested under bulk resolution rows. */
export const actionBlockerReferenceRowListClasses = usageReferenceRowListClasses

/** Bulleted lists in single blocked dialogs (flat, outside rows). */
export const actionBlockerReferenceFlatListClasses = usageReferenceFlatListClasses

export const actionBlockerReferenceGroupClasses = 'space-y-1' as const

export function formatActionBlockedUsageGroupSummary(input: {
  sourceKey: UsageBlockerSourceKey
  referenceCount: number
}): string {
  return formatUsageBlockerItemSummary(input.sourceKey, input.referenceCount)
}
