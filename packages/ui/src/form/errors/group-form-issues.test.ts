import { describe, expect, it } from 'vitest'

import { buildFieldSummaryText, buildHeaderIssuesSummaryText } from './group-form-issues'
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

function headerIssue(message: string, summaryMessage?: string): FormIssue {
  return {
    path: 'items.0',
    message,
    summaryMessage,
    severity: 'row',
    scope: 'item',
  }
}

describe('buildHeaderIssuesSummaryText', () => {
  it('prefers summaryMessage over message', () => {
    expect(buildHeaderIssuesSummaryText([headerIssue('Long field copy', 'Short row copy')])).toBe(
      'Short row copy',
    )
  })

  it('caps overflow the same way as field summaries', () => {
    expect(
      buildHeaderIssuesSummaryText([headerIssue('One'), headerIssue('Two'), headerIssue('Three')]),
    ).toBe('One · Two · +1 more')
  })
})
