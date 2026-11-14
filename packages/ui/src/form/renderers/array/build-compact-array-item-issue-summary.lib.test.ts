import { describe, expect, it } from 'vitest'

import type { FormIssue } from '../../errors/form-issue.types'
import { buildCompactArrayItemIssueSummaryText } from './build-compact-array-item-issue-summary.lib'

function rowIssue(message: string): FormIssue {
  return {
    path: 'items.0',
    message,
    severity: 'row',
    scope: 'item',
    itemPrefix: 'items.0',
    arrayPath: 'items',
    itemIndex: 0,
  }
}

describe('buildCompactArrayItemIssueSummaryText', () => {
  it('joins field summary and header issues when fields are suppressed', () => {
    expect(
      buildCompactArrayItemIssueSummaryText(
        {
          fieldSummary: 'Missing Rarity · Missing Quantity',
          headerIssues: [rowIssue('Row incompatible')],
        },
        { includeFieldSummary: true },
      ),
    ).toBe('Missing Rarity · Missing Quantity · Row incompatible')
  })

  it('returns header text only when field errors are inline', () => {
    expect(
      buildCompactArrayItemIssueSummaryText(
        {
          fieldSummary: 'Missing Rarity',
          headerIssues: [rowIssue('Row incompatible')],
        },
        { includeFieldSummary: false },
      ),
    ).toBe('Row incompatible')
  })

  it('returns field summary only when there are no header issues', () => {
    expect(
      buildCompactArrayItemIssueSummaryText(
        { fieldSummary: 'Missing Rarity', headerIssues: [] },
        { includeFieldSummary: true },
      ),
    ).toBe('Missing Rarity')
  })

  it('returns undefined when there is nothing to show', () => {
    expect(
      buildCompactArrayItemIssueSummaryText(
        { fieldSummary: 'Missing Rarity', headerIssues: [] },
        { includeFieldSummary: false },
      ),
    ).toBeUndefined()
  })
})
