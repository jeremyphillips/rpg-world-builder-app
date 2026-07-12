'use client'

import { Badge } from '../../components/ui/badge'
import { tabbedFormTabIssueSeparatorClasses } from './tabbed-form-tab-issue.variants'

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
      <Badge
        appearance="soft"
        tone="negative"
        size="sm"
        aria-hidden
        className="min-w-5 justify-center px-1 tabular-nums leading-none"
      >
        {count}
      </Badge>
      <span className="sr-only">, {tabIssueAttentionLabel(count)}</span>
    </>
  )
}

export { tabIssueAttentionLabel }
