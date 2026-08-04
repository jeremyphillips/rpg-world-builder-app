import {
  USAGE_REFERENCE_CHARACTER_GROUP_KEY,
  type UsageReferenceGroup,
} from '@/lib/usage-references/group-usage-references'
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

export function formatActionBlockedUsageGroupSummary(group: UsageReferenceGroup): string {
  if (group.key === USAGE_REFERENCE_CHARACTER_GROUP_KEY) {
    return group.count === 1
      ? 'Used by 1 active character'
      : `Used by ${group.count} active characters`
  }

  const noun = group.label.toLowerCase()
  return group.count === 1
    ? `Used by 1 active ${noun} entry`
    : `Used by ${group.count} active ${noun} entries`
}
