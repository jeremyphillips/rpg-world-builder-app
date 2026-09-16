import { describe, expect, it } from 'vitest'

import type { ArrayItemIssueGroup } from '../../errors/form-issue.types'
import { resolveArrayItemIssueSummary } from './array-field-item-issue-summary.lib'

const issueGroup = {
  itemPrefix: 'grants.0',
  arrayPath: 'grants',
  itemIndex: 0,
  totalCount: 2,
  sortedIssues: [],
  headerIssues: [],
  fieldIssues: [],
  fieldSummary: 'Missing Rarity · Missing Quantity',
} satisfies ArrayItemIssueGroup

describe('resolveArrayItemIssueSummary', () => {
  it('returns compact row summary props when field errors are suppressed', () => {
    expect(
      resolveArrayItemIssueSummary({
        showIssueChrome: true,
        variant: 'compact',
        collapsed: false,
        suppressFieldErrorText: true,
        issueGroup,
        rowSummaryId: 'grant-summary',
        onFocusIssue: () => undefined,
      }),
    ).toEqual({
      group: issueGroup,
      placement: 'compactSummary',
      summaryId: 'grant-summary',
    })
  })

  it('returns undefined for compact rows when field errors are inline', () => {
    expect(
      resolveArrayItemIssueSummary({
        showIssueChrome: true,
        variant: 'compact',
        collapsed: false,
        suppressFieldErrorText: false,
        issueGroup,
        rowSummaryId: 'grant-summary',
        onFocusIssue: () => undefined,
      }),
    ).toBeUndefined()
  })

  it('returns undefined when issue chrome is hidden', () => {
    expect(
      resolveArrayItemIssueSummary({
        showIssueChrome: false,
        variant: 'compact',
        collapsed: false,
        suppressFieldErrorText: true,
        issueGroup,
        rowSummaryId: 'grant-summary',
        onFocusIssue: () => undefined,
      }),
    ).toBeUndefined()
  })
})
