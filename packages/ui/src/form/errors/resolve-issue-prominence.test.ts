import { describe, expect, it } from 'vitest'

import { resolveIssueProminence } from './resolve-issue-prominence'

describe('resolveIssueProminence', () => {
  it.each([
    ['field', 'visible', 'action'],
    ['item', 'collapsed', 'nav'],
    ['item', 'visible', 'aggregate'],
    ['array', 'visible', 'structural'],
    ['array', 'collapsed', 'structural'],
    ['form', 'visible', 'structural'],
    ['field', 'hidden', 'structural'],
  ] as const)('maps %s + %s to %s', (scope, visibility, expected) => {
    expect(resolveIssueProminence(scope, visibility)).toBe(expected)
  })
})
