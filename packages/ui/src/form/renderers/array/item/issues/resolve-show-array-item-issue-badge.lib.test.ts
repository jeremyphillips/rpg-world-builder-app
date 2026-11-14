import { describe, expect, it } from 'vitest'

import { resolveShowArrayItemIssueBadge } from './resolve-show-array-item-issue-badge.lib'

describe('resolveShowArrayItemIssueBadge', () => {
  it('hides badges on expanded compact rows', () => {
    expect(
      resolveShowArrayItemIssueBadge({
        showIssueChrome: true,
        variant: 'compact',
        collapsed: false,
        issueGroup: { totalCount: 1 },
      }),
    ).toBe(false)
  })

  it('shows badges on collapsed detailed rows', () => {
    expect(
      resolveShowArrayItemIssueBadge({
        showIssueChrome: true,
        variant: 'detailed',
        collapsed: true,
        issueGroup: { totalCount: 1 },
      }),
    ).toBe(true)
  })

  it('hides badges on expanded detailed rows', () => {
    expect(
      resolveShowArrayItemIssueBadge({
        showIssueChrome: true,
        variant: 'detailed',
        collapsed: false,
        issueGroup: { totalCount: 1 },
      }),
    ).toBe(false)
  })

  it('hides badges when issue chrome is suppressed', () => {
    expect(
      resolveShowArrayItemIssueBadge({
        showIssueChrome: false,
        variant: 'detailed',
        collapsed: true,
        issueGroup: { totalCount: 1 },
      }),
    ).toBe(false)
  })
})
