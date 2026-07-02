import { describe, expect, it } from 'vitest'

import { buildFieldSummaryText } from './group-form-issues'
import type { FormIssue } from './form-issue.types'

function fieldIssue(summaryMessage: string, path: string): FormIssue {
  return {
    path,
    message: summaryMessage,
    summaryMessage,
    severity: 'field',
    scope: 'field',
    relativePath: path.split('.').pop() ?? path,
  }
}

describe('buildFieldSummaryText', () => {
  it('returns undefined for no field issues', () => {
    expect(buildFieldSummaryText([])).toBeUndefined()
  })

  it('joins a single issue', () => {
    expect(buildFieldSummaryText([fieldIssue('Missing rarity', 'grants.0.rarity')])).toBe(
      'Missing rarity',
    )
  })

  it('joins two issues without truncation', () => {
    expect(
      buildFieldSummaryText([
        fieldIssue('Missing rarity', 'grants.0.rarity'),
        fieldIssue('Missing quantity', 'grants.0.quantity'),
      ]),
    ).toBe('Missing rarity · Missing quantity')
  })

  it('caps named labels and appends overflow count', () => {
    expect(
      buildFieldSummaryText([
        fieldIssue('Missing rarity', 'grants.0.rarity'),
        fieldIssue('Missing quantity', 'grants.0.quantity'),
        fieldIssue('Missing label', 'grants.0.label'),
        fieldIssue('Missing type', 'grants.0.type'),
      ]),
    ).toBe('Missing rarity · Missing quantity · +2 more')
  })
})
