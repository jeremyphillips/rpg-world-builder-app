import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { buildAvailabilityCountSupplement } from './availability-count-supplement'

describe('buildAvailabilityCountSupplement', () => {
  it('renders available-only copy for stable master-detail rails', () => {
    render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 13, unavailableCount: 0, visibleCount: 13 },
          showUnavailable: false,
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
          onShow,
          onHide,
        })}
      </>,
    )

    expect(screen.getByText('13 available · 1 unavailable')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Hide unavailable items' }))
    expect(onHide).toHaveBeenCalledOnce()
  })

  it('omits Show when the only hidden unavailable row is pinned in the selection', () => {
    render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 1, unavailableCount: 1, visibleCount: 1 },
          showUnavailable: false,
          hiddenUnavailableCount: 0,
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
})
