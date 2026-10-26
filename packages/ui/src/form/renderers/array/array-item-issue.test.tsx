import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  ArrayItemIssueButton,
  ArrayItemIssueSummary,
  ArrayLegendIssueLink,
  arrayLegendIssueLabel,
} from './array-item-issue.client'

describe('array-item-issue', () => {
  it('renders badge with semantic negative styling', () => {
    render(<ArrayItemIssueButton issueCount={2} rowLabel="Hero" />)

    const badge = screen.getByRole('button', { name: '2 issues in Hero' })
    expect(badge).toHaveClass('ui-badge', 'ui-badge--sm', 'ui-badge--soft-destructive')
    expect(badge).not.toHaveClass('ui-badge--counter', 'ui-chip')
    expect(badge).toHaveTextContent('2 issues')
    expect(badge.querySelector('svg')).toHaveClass('ui-icon--owner')
    expect(badge.querySelector('svg')).not.toHaveClass('ui-icon--inline', 'ui-icon--2xl')
    expect(badge.querySelector('button')).toBeNull()
  })

  it('shows compact count-only badge text with full aria-label', () => {
    render(<ArrayItemIssueButton issueCount={2} rowLabel="Grant 1" compact />)

    const badge = screen.getByRole('button', { name: '2 issues in Grant 1' })
    expect(badge).toHaveTextContent('2')
    expect(badge).not.toHaveTextContent('issues')
    expect(badge).toHaveClass('ui-badge--counter', 'ui-badge--sm', 'ui-badge--soft-destructive')
  })

  it('activates on click and Enter', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(<ArrayItemIssueButton issueCount={1} rowLabel="Row" onPress={onPress} compact />)

    const badge = screen.getByRole('button', { name: '1 issue in Row' })
    await user.click(badge)
    expect(onPress).toHaveBeenCalledOnce()

    badge.focus()
    await user.keyboard('{Enter}')
    expect(onPress).toHaveBeenCalledTimes(2)
  })

  it('renders compact field summary text', () => {
    render(
      <ArrayItemIssueSummary
        placement="compactSummary"
        summaryId="grant-0-summary"
        group={{
          totalCount: 2,
          sortedIssues: [],
          headerIssues: [],
          fieldSummary: 'Missing Rarity · Missing Quantity',
        }}
      />,
    )

    const summary = screen.getByRole('alert')
    expect(summary).toHaveAttribute('id', 'grant-0-summary')
    expect(summary).toHaveAttribute('aria-live', 'polite')
    expect(summary).toHaveTextContent('Missing Rarity · Missing Quantity')
  })

  it('formats legend issue labels', () => {
    expect(arrayLegendIssueLabel(2, 1)).toBe('2 issues in 1 row')
    expect(arrayLegendIssueLabel(1, 3)).toBe('1 issue in 3 rows')
  })

  it('renders legend link with issue and row counts', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()

    render(
      <ArrayLegendIssueLink
        issueCount={2}
        invalidRowCount={1}
        sectionLabel="Magic item grants"
        onPress={onPress}
      />,
    )

    const link = screen.getByRole('button', {
      name: 'Review 2 issues in 1 row in Magic item grants',
    })
    expect(link).toHaveTextContent('2 issues in 1 row')
    expect(link).toHaveClass('text-destructive-muted')
    expect(link.querySelector('svg')).toHaveClass('ui-icon--inline')

    await user.click(link)
    expect(onPress).toHaveBeenCalledOnce()
  })
})
