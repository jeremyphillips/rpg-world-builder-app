'use client'

import { AlertTriangle } from 'lucide-react'

import { cn } from '../../lib/utils'
import type { ArrayItemIssueGroup } from '../errors/form-issue.types'
import {
  arrayItemIssueBadgeClasses,
  arrayItemIssueSummaryClasses,
  arrayLegendIssueLinkClasses,
  type ArrayItemIssueProminence,
} from './array-item-issue.variants'

function issueCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'issue' : 'issues'}`
}

function issueCountCompactLabel(count: number): string {
  return String(count)
}

function arrayLegendIssueLabel(issueCount: number, invalidRowCount: number): string {
  const rowLabel = invalidRowCount === 1 ? '1 row' : `${invalidRowCount} rows`
  return `${issueCountLabel(issueCount)} in ${rowLabel}`
}

export interface ArrayItemIssueBadgeProps {
  issueCount: number
  rowLabel: string
  onPress?: () => void
  compact?: boolean
  prominence?: ArrayItemIssueProminence
}

export function ArrayItemIssueBadge({
  issueCount,
  rowLabel,
  onPress,
  compact = false,
  prominence = 'nav',
}: ArrayItemIssueBadgeProps) {
  if (issueCount <= 0) return null

  return (
    <button
      type="button"
      className={arrayItemIssueBadgeClasses({ compact, prominence })}
      aria-label={`${issueCountLabel(issueCount)} in ${rowLabel}`}
      onClick={onPress}
    >
      <AlertTriangle className="size-3.5" aria-hidden />
      <span className={compact ? 'tabular-nums' : undefined}>
        {compact ? issueCountCompactLabel(issueCount) : issueCountLabel(issueCount)}
      </span>
    </button>
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
        <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
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
  issueCount: number
  invalidRowCount: number
  sectionLabel: string
  onPress?: () => void
  prominence?: Extract<ArrayItemIssueProminence, 'nav' | 'aggregate'>
}

export function ArrayLegendIssueLink({
  issueCount,
  invalidRowCount,
  sectionLabel,
  onPress,
  prominence = 'nav',
}: ArrayLegendIssueLinkProps) {
  if (issueCount <= 0 || invalidRowCount <= 0) return null

  const label = arrayLegendIssueLabel(issueCount, invalidRowCount)

  return (
    <button
      type="button"
      className={arrayLegendIssueLinkClasses({ prominence })}
      aria-label={`Review ${label} in ${sectionLabel}`}
      onClick={onPress}
    >
      <AlertTriangle className="size-3.5" aria-hidden />
      {label}
    </button>
  )
}

export { issueCountLabel, issueCountCompactLabel, arrayLegendIssueLabel }
