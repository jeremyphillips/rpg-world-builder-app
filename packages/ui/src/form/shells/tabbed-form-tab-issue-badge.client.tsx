'use client'

import { ValidationIssueCountBadge } from '../../components/ui/validation-issue-count-badge.client'

function tabIssueAttentionLabel(count: number): string {
  return `${count} ${count === 1 ? 'field needs' : 'fields need'} attention`
}

export interface TabbedFormTabIssueBadgeProps {
  count: number
}

/** Compact destructive count badge for tab triggers after a failed submit. */
export function TabbedFormTabIssueBadge({ count }: TabbedFormTabIssueBadgeProps) {
  if (count <= 0) return null

  return (
    <>
      <ValidationIssueCountBadge count={count} />
      <span className="sr-only">, {tabIssueAttentionLabel(count)}</span>
    </>
  )
}

export { tabIssueAttentionLabel }
