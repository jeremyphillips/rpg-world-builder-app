'use client'

import { AlertTriangle } from 'lucide-react'

import { cn } from '../../lib/utils'
import type { ArrayItemIssueGroup } from '../errors/form-issue.types'
import {
  arrayItemIssueBadgeClasses,
  arrayItemIssueSummaryClasses,
  arrayLegendIssueLinkClasses,
} from './array-item-issue.variants'

function issueCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'issue' : 'issues'}`
}

export interface ArrayItemIssueBadgeProps {
  issueCount: number
  rowLabel: string
  onPress?: () => void
  compact?: boolean
}

export function ArrayItemIssueBadge({
  issueCount,
  rowLabel,
  onPress,
  compact = false,
}: ArrayItemIssueBadgeProps) {
  if (issueCount <= 0) return null

  return (
    <button
      type="button"
      className={arrayItemIssueBadgeClasses({ compact })}
      aria-label={`${issueCountLabel(issueCount)} in ${rowLabel}`}
      onClick={onPress}
    >
      <AlertTriangle className="size-3.5" aria-hidden />
      <span>{issueCountLabel(issueCount)}</span>
    </button>
  )
}

export interface ArrayItemIssueSummaryProps {
  group: Pick<ArrayItemIssueGroup, 'totalCount' | 'sortedIssues' | 'headerIssues'>
  onPrimaryPress?: () => void
  onMorePress?: () => void
  placement?: 'collapsed' | 'expanded'
  className?: string
}

export function ArrayItemIssueSummary({
  group,
  onPrimaryPress,
  onMorePress,
  placement = 'collapsed',
  className,
}: ArrayItemIssueSummaryProps) {
  if (group.totalCount <= 0) return null

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
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
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
  invalidRowCount: number
  onPress?: () => void
}

export function ArrayLegendIssueLink({ invalidRowCount, onPress }: ArrayLegendIssueLinkProps) {
  if (invalidRowCount <= 0) return null

  return (
    <button
      type="button"
      className={arrayLegendIssueLinkClasses}
      aria-label={`Review ${issueCountLabel(invalidRowCount)} in this section`}
      onClick={onPress}
    >
      <AlertTriangle className="size-3.5" aria-hidden />
      {invalidRowCount} invalid {invalidRowCount === 1 ? 'row' : 'rows'}
    </button>
  )
}
