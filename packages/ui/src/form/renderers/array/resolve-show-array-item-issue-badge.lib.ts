import type { ArrayItemIssueGroup } from '../../errors/form-issue.types'

/**
 * Row issue badges steal width on expanded flat rows where field errors or a
 * compact summary already carry the signal. Reserve badges for collapsed rows
 * (and other cases where invalid fields are not directly visible).
 */
export function resolveShowArrayItemIssueBadge(options: {
  showIssueChrome: boolean
  variant: 'compact' | 'detailed'
  collapsed: boolean
  issueGroup: Pick<ArrayItemIssueGroup, 'totalCount'>
}): boolean {
  const { showIssueChrome, variant, collapsed, issueGroup } = options
  if (!showIssueChrome || issueGroup.totalCount <= 0) return false
  if (variant === 'compact') return false
  return collapsed
}
