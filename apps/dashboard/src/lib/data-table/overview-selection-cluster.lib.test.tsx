/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  resolvePageSelectionActionLabel,
  shouldShowPageSelectionAction,
} from './overview-selection-cluster.lib'

describe('overview selection cluster helpers', () => {
  it('labels cap-aware page selection', () => {
    expect(
      resolvePageSelectionActionLabel({
        isAllPageRowsSelected: false,
        pageSelectableCount: 20,
        remainingSelectionCapacity: 48,
      }),
    ).toBe('Select page')

    expect(
      resolvePageSelectionActionLabel({
        isAllPageRowsSelected: false,
        pageSelectableCount: 20,
        remainingSelectionCapacity: 5,
      }),
    ).toBe('Select 5')

    expect(
      resolvePageSelectionActionLabel({
        isAllPageRowsSelected: true,
        pageSelectableCount: 20,
        remainingSelectionCapacity: 10,
      }),
    ).toBe('Clear page')
  })

  it('shows page action when rows remain or page is fully selected', () => {
    expect(shouldShowPageSelectionAction(0, false)).toBe(false)
    expect(shouldShowPageSelectionAction(3, false)).toBe(true)
    expect(shouldShowPageSelectionAction(0, true)).toBe(true)
  })
})

describe('OverviewResultSummary', () => {
  it('renders a polite result count', async () => {
    const { OverviewResultSummary } = await import('./overview-result-summary')
    const { container } = render(<OverviewResultSummary resultCount={10} />)
    expect(screen.getByText('10 results')).toHaveAttribute('aria-live', 'polite')
    expect(container.firstChild).toHaveClass('text-xs')
  })
})
