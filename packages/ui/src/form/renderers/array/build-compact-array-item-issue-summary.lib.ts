import { joinArrayItemSummaryParts } from '../../config/array/array-item-config.lib'
import { buildHeaderIssuesSummaryText } from '../../errors/group-form-issues'
import type { ArrayItemIssueGroup } from '../../errors/form-issue.types'

/** Joined compact row summary for suppressed fields and/or row-level header issues. */
export function buildCompactArrayItemIssueSummaryText(
  group: Pick<ArrayItemIssueGroup, 'fieldSummary' | 'headerIssues'>,
  options: { includeFieldSummary: boolean },
): string | undefined {
  const parts: string[] = []

  if (options.includeFieldSummary) {
    if (group.fieldSummary) parts.push(group.fieldSummary)
  }

  const headerSummary = buildHeaderIssuesSummaryText(group.headerIssues)
  if (headerSummary) parts.push(headerSummary)

  if (parts.length === 0) return undefined
  if (parts.length === 1) return parts[0]
  return joinArrayItemSummaryParts(parts)
}
