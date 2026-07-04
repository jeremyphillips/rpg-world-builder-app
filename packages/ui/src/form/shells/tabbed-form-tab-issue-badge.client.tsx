'use client'

import {
  tabbedFormTabIssueBadgeClasses,
  tabbedFormTabIssueSeparatorClasses,
} from './tabbed-form-tab-issue.variants'

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
      <span aria-hidden className={tabbedFormTabIssueSeparatorClasses}>
        {' · '}
      </span>
      <span aria-hidden className={tabbedFormTabIssueBadgeClasses}>
        {count}
      </span>
      <span className="sr-only">, {tabIssueAttentionLabel(count)}</span>
    </>
  )
}

export { tabIssueAttentionLabel }
