import { buildFieldSummaryText, buildHeaderIssuesSummaryText } from '../../errors/group-form-issues'
import type { ArrayItemIssueGroup } from '../../errors/form-issue.types'
import type { ArrayItemIssueSummaryProps } from './array-item-issue.client'
import { fieldIssuesNeedJoinedSummary } from './array-item-field-issue-inline.lib'

export type ArrayItemValidationPresentation = {
  /** Static row-level messages from {@link ArrayItemIssueGroup.headerIssues}. */
  rowAlert?: ArrayItemIssueSummaryProps
  /** Joined field messages when inline copy is suppressed or fields are not rendered. */
  fieldJoin?: ArrayItemIssueSummaryProps
  showRowInvalidBorder: boolean
}

function buildRowAlertProps(
  issueGroup: ArrayItemIssueGroup,
  rowSummaryId: string,
): ArrayItemIssueSummaryProps | undefined {
  const rowAlertText = buildHeaderIssuesSummaryText(issueGroup.headerIssues)
  if (!rowAlertText) return undefined

  return {
    group: issueGroup,
    placement: 'rowAlert',
    summaryId: rowSummaryId,
    compactSummaryText: rowAlertText,
  }
}

function buildFieldJoinProps(
  issueGroup: ArrayItemIssueGroup,
  fieldJoinSummaryId: string,
): ArrayItemIssueSummaryProps | undefined {
  const fieldJoinText = issueGroup.fieldSummary ?? buildFieldSummaryText(issueGroup.fieldIssues)
  if (!fieldJoinText) return undefined

  return {
    group: issueGroup,
    placement: 'compactSummary',
    summaryId: fieldJoinSummaryId,
    compactSummaryText: fieldJoinText,
  }
}

export function resolveArrayItemValidationPresentation(options: {
  showIssueChrome: boolean
  suppressFieldErrorText: boolean
  hasVisibleBodyFields: boolean
  collapsed: boolean
  itemPrefix: string
  fieldOrder: readonly string[]
  inactivePaths: ReadonlySet<string>
  issueGroup: ArrayItemIssueGroup
  rowSummaryId: string
  fieldJoinSummaryId: string
}): ArrayItemValidationPresentation {
  const {
    showIssueChrome,
    suppressFieldErrorText,
    hasVisibleBodyFields,
    collapsed,
    itemPrefix,
    fieldOrder,
    inactivePaths,
    issueGroup,
    rowSummaryId,
    fieldJoinSummaryId,
  } = options

  const showRowInvalidBorder = showIssueChrome && issueGroup.headerIssues.length > 0

  if (!showIssueChrome || issueGroup.totalCount <= 0) {
    return { showRowInvalidBorder: false }
  }

  const rowAlert = buildRowAlertProps(issueGroup, rowSummaryId)

  const shouldJoinFieldSummary =
    issueGroup.fieldIssues.length > 0 &&
    (suppressFieldErrorText ||
      fieldIssuesNeedJoinedSummary(issueGroup.fieldIssues, {
        itemPrefix,
        fieldOrder,
        inactivePaths,
        hasVisibleBodyFields,
        collapsed,
      }))
  const fieldJoin = shouldJoinFieldSummary
    ? buildFieldJoinProps(issueGroup, fieldJoinSummaryId)
    : undefined

  return {
    rowAlert,
    fieldJoin,
    showRowInvalidBorder,
  }
}

/** Ordered issue summaries for array item chrome slots. */
export function arrayItemIssueSummaries(
  presentation: ArrayItemValidationPresentation,
): ArrayItemIssueSummaryProps[] {
  const summaries: ArrayItemIssueSummaryProps[] = []
  if (presentation.rowAlert) summaries.push(presentation.rowAlert)
  if (presentation.fieldJoin) summaries.push(presentation.fieldJoin)
  return summaries
}

/**
 * @deprecated Use {@link resolveArrayItemValidationPresentation} and {@link arrayItemIssueSummaries}.
 * Returns the first visible summary for legacy single-slot callers.
 */
export function resolveArrayItemIssueSummary(options: {
  showIssueChrome: boolean
  variant: 'compact' | 'detailed'
  collapsed: boolean
  suppressFieldErrorText: boolean
  hasVisibleBodyFields?: boolean
  issueGroup: ArrayItemIssueGroup
  rowSummaryId: string
  onFocusIssue: () => void
}): ArrayItemIssueSummaryProps | undefined {
  const fieldJoinSummaryId = `${options.rowSummaryId}-fields`
  const presentation = resolveArrayItemValidationPresentation({
    showIssueChrome: options.showIssueChrome,
    suppressFieldErrorText: options.suppressFieldErrorText,
    hasVisibleBodyFields: options.hasVisibleBodyFields ?? true,
    collapsed: options.collapsed,
    itemPrefix: options.issueGroup.itemPrefix,
    fieldOrder: [],
    inactivePaths: new Set(),
    issueGroup: options.issueGroup,
    rowSummaryId: options.rowSummaryId,
    fieldJoinSummaryId,
  })
  return arrayItemIssueSummaries(presentation)[0]
}
