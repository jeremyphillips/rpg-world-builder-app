import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  ArrayItemIssueBadge,
  ArrayItemIssueSummary,
  ArrayLegendIssueLink,
  arrayLegendIssueLabel,
} from './array-item-issue.client'

describe('array-item-issue', () => {
  it('renders badge prominence classes', () => {
    const { rerender } = render(
      <ArrayItemIssueBadge issueCount={2} rowLabel="Hero" prominence="action" />,
    )

    expect(screen.getByRole('button', { name: '2 issues in Hero' })).toHaveClass('text-destructive')

    rerender(<ArrayItemIssueBadge issueCount={2} rowLabel="Hero" prominence="aggregate" />)
    expect(screen.getByRole('button', { name: '2 issues in Hero' })).toHaveClass(
      'text-destructive-subtle',
    )
  })

  it('renders compact field summary text', () => {
    render(
      <ArrayItemIssueSummary
        placement="compactSummary"
        group={{
          totalCount: 2,
          sortedIssues: [],
          headerIssues: [],
          fieldSummary: 'Missing Rarity · Missing Quantity',
        }}
      />,
    )

    expect(screen.getByText('Missing Rarity · Missing Quantity')).toBeInTheDocument()
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

    await user.click(link)
    expect(onPress).toHaveBeenCalledOnce()
  })
})
