import type { ArrayItemIssueGroup } from '../errors/form-issue.types'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'

export function resolveArrayItemIssueSummary(options: {
  showIssueChrome: boolean
  variant: 'compact' | 'detailed'
  collapsed: boolean
  issueGroup: ArrayItemIssueGroup
  rowSummaryId: string
  onFocusIssue: () => void
}): ArrayItemIssueSummaryProps | undefined {
  const { showIssueChrome, variant, collapsed, issueGroup, rowSummaryId, onFocusIssue } = options
  if (!showIssueChrome || issueGroup.totalCount <= 0) return undefined

  if (variant === 'compact' && issueGroup.fieldSummary) {
    return {
      group: issueGroup,
      placement: 'compactSummary',
      summaryId: rowSummaryId,
    }
  }

  if (variant === 'detailed' && (collapsed || issueGroup.headerIssues.length > 0)) {
    return {
      group: issueGroup,
      onPrimaryPress: onFocusIssue,
      onMorePress: onFocusIssue,
      placement: collapsed ? 'collapsed' : 'expanded',
    }
  }

  return undefined
}
