import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { OverviewResultSummary } from '@/lib/data-table/overview-result-summary'

import { buildAvailabilityCountSupplement } from './availability-count-supplement'

describe('buildAvailabilityCountSupplement', () => {
  it('renders available-only copy for stable master-detail rails', () => {
    render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 13, unavailableCount: 0, visibleCount: 13 },
          showUnavailable: false,
          layout: 'stable',
          onShow: vi.fn(),
          onHide: vi.fn(),
        })}
      </>,
    )

    expect(screen.getByText('13 available')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all campaign availability states' }),
    ).toBeNull()
  })

  it('renders mixed pair counts with Show for master-detail rails', () => {
    render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 13, unavailableCount: 1, visibleCount: 13 },
          showUnavailable: false,
          layout: 'stable',
          onShow: vi.fn(),
          onHide: vi.fn(),
        })}
      </>,
    )

    expect(screen.getByText('13 available · 1 unavailable')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Show all campaign availability states' }),
    ).toBeInTheDocument()
  })

  it('renders Hide when unavailable rows are revealed', async () => {
    const user = userEvent.setup()
    const onShow = vi.fn()
    const onHide = vi.fn()

    const { rerender } = render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 13, unavailableCount: 1, visibleCount: 13 },
          showUnavailable: false,
          layout: 'stable',
          onShow,
          onHide,
        })}
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Show all campaign availability states' }))
    expect(onShow).toHaveBeenCalledOnce()

    rerender(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 13, unavailableCount: 1, visibleCount: 14 },
          showUnavailable: true,
          layout: 'stable',
          onShow,
          onHide,
        })}
      </>,
    )

    expect(screen.getByText('13 available · 1 unavailable')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hide unavailable items' }))
    expect(onHide).toHaveBeenCalledOnce()
  })

  it('omits the conditional overview supplement when nothing is hidden', () => {
    expect(
      buildAvailabilityCountSupplement({
        scope: { availableCount: 4, unavailableCount: 0, visibleCount: 4 },
        showUnavailable: false,
        layout: 'conditional',
        actionVariant: 'overview',
        onShow: vi.fn(),
        onHide: vi.fn(),
      }),
    ).toBeNull()
  })

  it('omits Show when the only hidden unavailable row is pinned in the selection', () => {
    render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 1, unavailableCount: 1, visibleCount: 1 },
          showUnavailable: false,
          hiddenUnavailableCount: 0,
          layout: 'stable',
          onShow: vi.fn(),
          onHide: vi.fn(),
        })}
      </>,
    )

    expect(screen.getByText('1 available · 1 unavailable')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Show all campaign availability states' }),
    ).toBeNull()
  })

  it('integrates with OverviewResultSummary without restating available rows', () => {
    const { container } = render(
      <OverviewResultSummary
        resultCount={13}
        supplementalContent={buildAvailabilityCountSupplement({
          scope: { availableCount: 13, unavailableCount: 1, visibleCount: 13 },
          showUnavailable: false,
          layout: 'conditional',
          actionVariant: 'overview',
          onShow: vi.fn(),
          onHide: vi.fn(),
        })}
      />,
    )

    expect(screen.getByText('13 results')).toBeInTheDocument()
    expect(screen.getByText('1 unavailable')).toBeInTheDocument()
    expect(container).not.toHaveTextContent('13 available')
    expect(
      screen.getByRole('button', { name: 'Show all campaign availability states' }),
    ).toBeInTheDocument()
  })
})
