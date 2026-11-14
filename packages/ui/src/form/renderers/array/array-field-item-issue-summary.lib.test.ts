import { describe, expect, it } from 'vitest'

import type { ArrayItemIssueGroup, FormIssue } from '../../errors/form-issue.types'
import {
  arrayItemIssueSummaries,
  resolveArrayItemValidationPresentation,
} from './array-field-item-issue-summary.lib'

const rarityFieldIssue: FormIssue = {
  path: 'grants.0.rarity',
  relativePath: 'rarity',
  message: 'Missing Rarity',
  severity: 'field',
  scope: 'field',
  itemPrefix: 'grants.0',
  arrayPath: 'grants',
  itemIndex: 0,
}

const quantityFieldIssue: FormIssue = {
  path: 'grants.0.quantity',
  relativePath: 'quantity',
  message: 'Missing Quantity',
  severity: 'field',
  scope: 'field',
  itemPrefix: 'grants.0',
  arrayPath: 'grants',
  itemIndex: 0,
}

const fieldIssueGroup = {
  itemPrefix: 'grants.0',
  arrayPath: 'grants',
  itemIndex: 0,
  totalCount: 2,
  sortedIssues: [rarityFieldIssue, quantityFieldIssue],
  headerIssues: [],
  fieldIssues: [rarityFieldIssue, quantityFieldIssue],
  fieldSummary: 'Missing Rarity · Missing Quantity',
} satisfies ArrayItemIssueGroup

const headerRowIssue: FormIssue = {
  path: 'items.0',
  message: 'Row incompatible',
  severity: 'row',
  scope: 'item',
  itemPrefix: 'items.0',
  arrayPath: 'items',
  itemIndex: 0,
}

const headerOnlyIssueGroup = {
  itemPrefix: 'items.0',
  arrayPath: 'items',
  itemIndex: 0,
  totalCount: 1,
  sortedIssues: [headerRowIssue],
  headerIssues: [headerRowIssue],
  fieldIssues: [],
  fieldSummary: undefined,
} satisfies ArrayItemIssueGroup

const mixedIssueGroup = {
  ...fieldIssueGroup,
  totalCount: 3,
  sortedIssues: [headerRowIssue],
  headerIssues: [headerRowIssue],
  fieldSummary: 'Missing Rarity · Missing Quantity',
} satisfies ArrayItemIssueGroup

function present(
  overrides: Partial<Parameters<typeof resolveArrayItemValidationPresentation>[0]> = {},
) {
  return resolveArrayItemValidationPresentation({
    showIssueChrome: true,
    suppressFieldErrorText: false,
    hasVisibleBodyFields: true,
    collapsed: false,
    itemPrefix: 'grants.0',
    fieldOrder: ['rarity', 'quantity'],
    inactivePaths: new Set(),
    issueGroup: headerOnlyIssueGroup,
    rowSummaryId: 'item-summary',
    fieldJoinSummaryId: 'item-summary-fields',
    ...overrides,
  })
}

describe('resolveArrayItemValidationPresentation', () => {
  it('returns row alert for header-only issues regardless of variant anatomy', () => {
    const presentation = present({ issueGroup: headerOnlyIssueGroup })
    expect(presentation.showRowInvalidBorder).toBe(true)
    expect(presentation.rowAlert).toMatchObject({
      placement: 'rowAlert',
      summaryId: 'item-summary',
      compactSummaryText: 'Row incompatible',
    })
    expect(presentation.fieldJoin).toBeUndefined()
  })

  it('returns field join when field errors are suppressed', () => {
    const presentation = present({
      suppressFieldErrorText: true,
      issueGroup: fieldIssueGroup,
    })
    expect(presentation.showRowInvalidBorder).toBe(false)
    expect(presentation.rowAlert).toBeUndefined()
    expect(presentation.fieldJoin).toMatchObject({
      placement: 'compactSummary',
      compactSummaryText: 'Missing Rarity · Missing Quantity',
    })
  })

  it('omits field join when only field errors are inline on visible controls', () => {
    const presentation = present({ issueGroup: fieldIssueGroup })
    expect(arrayItemIssueSummaries(presentation)).toEqual([])
  })

  it('splits row alert and field join when both exist and fields are suppressed', () => {
    const presentation = present({
      suppressFieldErrorText: true,
      issueGroup: mixedIssueGroup,
    })
    expect(presentation.rowAlert?.compactSummaryText).toBe('Row incompatible')
    expect(presentation.fieldJoin?.compactSummaryText).toBe('Missing Rarity · Missing Quantity')
    expect(arrayItemIssueSummaries(presentation)).toHaveLength(2)
  })

  it('returns row alert only when row and inline field issues coexist', () => {
    const presentation = present({ issueGroup: mixedIssueGroup })
    expect(presentation.rowAlert?.compactSummaryText).toBe('Row incompatible')
    expect(presentation.fieldJoin).toBeUndefined()
  })

  it('joins field summary when body fields are not rendered', () => {
    const presentation = present({
      hasVisibleBodyFields: false,
      issueGroup: fieldIssueGroup,
    })
    expect(presentation.fieldJoin).toBeDefined()
    expect(presentation.rowAlert).toBeUndefined()
  })

  it('returns no presentation when issue chrome is hidden', () => {
    const presentation = present({ showIssueChrome: false, issueGroup: mixedIssueGroup })
    expect(presentation.showRowInvalidBorder).toBe(false)
    expect(arrayItemIssueSummaries(presentation)).toEqual([])
  })

  it('joins field summary when a bodied row has errors on unregistered paths', () => {
    const hiddenPathIssue: FormIssue = {
      path: 'grants.0.kind',
      relativePath: 'kind',
      message: 'Invalid kind',
      severity: 'field',
      scope: 'field',
      itemPrefix: 'grants.0',
      arrayPath: 'grants',
      itemIndex: 0,
    }
    const issueGroup = {
      ...fieldIssueGroup,
      totalCount: 1,
      sortedIssues: [hiddenPathIssue],
      fieldIssues: [hiddenPathIssue],
      fieldSummary: 'Invalid kind',
    } satisfies ArrayItemIssueGroup

    const presentation = present({ issueGroup, hasVisibleBodyFields: true })
    expect(presentation.fieldJoin?.compactSummaryText).toBe('Invalid kind')
  })

  it('joins field summary on collapsed bodied rows', () => {
    const presentation = present({
      issueGroup: fieldIssueGroup,
      hasVisibleBodyFields: true,
      collapsed: true,
    })
    expect(presentation.fieldJoin?.compactSummaryText).toBe('Missing Rarity · Missing Quantity')
  })
})
