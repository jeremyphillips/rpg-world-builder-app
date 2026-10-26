'use client'
import { Badge } from '../../../components/ui/badge'
import { Icon } from '../../../components/ui/icon/icon'

import { cn } from '../../../lib/utils'
import type { ArrayItemIssueGroup } from '../../errors/form-issue.types'
import {
  arrayItemIssueSummaryClasses,
  arrayLegendIssueLinkClasses,
  type ArrayItemIssueProminence,
} from './array-item-issue.variants'

function issueCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'issue' : 'issues'}`
}

function formatIssueCountCompact(count: number): string {
  return String(count)
}

function arrayLegendIssueLabel(issueCount: number, invalidRowCount: number): string {
  const rowLabel = invalidRowCount === 1 ? '1 row' : `${invalidRowCount} rows`
  return `${issueCountLabel(issueCount)} in ${rowLabel}`
}

const arrayItemIssueButtonFocusClasses = cn(
  'ui-focus-ring',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
)

export interface ArrayItemIssueButtonProps {
  issueCount: number
  rowLabel: string
  onPress?: () => void
  compact?: boolean
}

/** Array row issue affordance — destructive-soft `Badge` on a native `button`. */
export function ArrayItemIssueButton({
  issueCount,
  rowLabel,
  onPress,
  compact = false,
}: ArrayItemIssueButtonProps) {
  if (issueCount <= 0) return null

  return (
    <Badge
      asChild
      appearance="soft"
      tone="destructive"
      size="sm"
      layout={compact ? 'counter' : 'label'}
      className={cn('shrink-0', arrayItemIssueButtonFocusClasses)}
    >
      <button
        type="button"
        aria-label={`${issueCountLabel(issueCount)} in ${rowLabel}`}
        onClick={onPress}
      >
        <Icon name="triangle-alert" size="owner" />
        <span>{compact ? formatIssueCountCompact(issueCount) : issueCountLabel(issueCount)}</span>
      </button>
    </Badge>
  )
}

export interface ArrayItemIssueSummaryProps {
  group: Pick<ArrayItemIssueGroup, 'totalCount' | 'sortedIssues' | 'headerIssues' | 'fieldSummary'>
  onPrimaryPress?: () => void
  onMorePress?: () => void
  placement?: 'collapsed' | 'expanded' | 'compactSummary'
  /** Stable id for compact row summaries — wired to suppressed field `aria-describedby`. */
  summaryId?: string
  className?: string
}

export function ArrayItemIssueSummary({
  group,
  onPrimaryPress,
  onMorePress,
  placement = 'collapsed',
  summaryId,
  className,
}: ArrayItemIssueSummaryProps) {
  if (group.totalCount <= 0) return null

  if (placement === 'compactSummary') {
    if (!group.fieldSummary) return null

    return (
      <p
        id={summaryId}
        role="alert"
        aria-live="polite"
        className={cn(arrayItemIssueSummaryClasses({ placement }), className)}
        data-array-item-issue-summary
      >
        {group.fieldSummary}
      </p>
    )
  }

  const displayIssues =
    placement === 'expanded' && group.headerIssues.length > 0
      ? group.headerIssues
      : group.sortedIssues
  const firstIssue = displayIssues[0] ?? group.sortedIssues[0]
  if (!firstIssue) return null

  const remainingCount = group.totalCount - 1

  return (
    <div
      role="alert"
      className={cn(arrayItemIssueSummaryClasses({ placement }), className)}
      data-array-item-issue-summary
    >
      <Icon name="triangle-alert" size="inline" className="shrink-0" />
      <button type="button" onClick={onPrimaryPress}>
        {firstIssue.message}
      </button>
      {remainingCount > 0 ? (
        <button type="button" onClick={onMorePress ?? onPrimaryPress}>
          +{remainingCount} more
        </button>
      ) : null}
    </div>
  )
}

export interface ArrayLegendIssueLinkProps {
  issueCount: number
  invalidRowCount: number
  hasContainerIssue?: boolean
  sectionLabel: string
  onPress?: () => void
  prominence?: Extract<ArrayItemIssueProminence, 'nav' | 'aggregate'>
}

function resolveArrayLegendIssueLabel(
  issueCount: number,
  invalidRowCount: number,
  hasContainerIssue: boolean,
): string {
  if (invalidRowCount > 0) {
    return arrayLegendIssueLabel(issueCount, invalidRowCount)
  }
  if (hasContainerIssue) {
    return issueCountLabel(issueCount)
  }
  return issueCountLabel(issueCount)
}

export function ArrayLegendIssueLink({
  issueCount,
  invalidRowCount,
  hasContainerIssue = false,
  sectionLabel,
  onPress,
  prominence = 'nav',
}: ArrayLegendIssueLinkProps) {
  if (issueCount <= 0) return null
  if (invalidRowCount <= 0 && !hasContainerIssue) return null

  const label = resolveArrayLegendIssueLabel(issueCount, invalidRowCount, hasContainerIssue)

  return (
    <button
      type="button"
      className={arrayLegendIssueLinkClasses({ prominence })}
      aria-label={`Review ${label} in ${sectionLabel}`}
      onClick={onPress}
    >
      <Icon name="triangle-alert" size="inline" />
      {label}
    </button>
  )
}

export { issueCountLabel, formatIssueCountCompact, arrayLegendIssueLabel }
