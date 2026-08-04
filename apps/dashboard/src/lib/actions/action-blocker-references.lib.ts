import { formatUsageBlockerItemSummary } from '@/lib/usage-references/usage-blocker-copy'
import type { UsageBlockerSourceKey } from '@rpg/contracts'

import {
  usageReferenceFlatListClasses,
  usageReferenceRowListClasses,
} from '@/lib/usage-references/usage-reference-list.lib'

/** Shared chrome for blocker reference summaries in bulk resolution rows. */
export const actionBlockerReferenceSummaryClasses = 'text-xs text-muted-foreground' as const

/** Bulleted lists nested under bulk resolution rows. */
export const actionBlockerReferenceRowListClasses = usageReferenceRowListClasses

/** Bulleted lists in single blocked dialogs (flat, outside rows). */
export const actionBlockerReferenceFlatListClasses = usageReferenceFlatListClasses

/** @deprecated Use actionBlockerReferenceRowListClasses or actionBlockerReferenceFlatListClasses. */
export const actionBlockerReferenceListClasses = actionBlockerReferenceRowListClasses

export const actionBlockerReferenceGroupClasses = 'space-y-1' as const

/** Subtle error panel for flat single-blocked reference lists. */
export const actionBlockedFlatPanelClasses = 'rounded-md bg-destructive-subtle px-3 py-2.5' as const

export function formatActionBlockedUsageGroupSummary(input: {
  sourceKey: UsageBlockerSourceKey
  referenceCount: number
}): string {
  return formatUsageBlockerItemSummary(input.sourceKey, input.referenceCount)
}
