import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { buildAvailabilityCountSupplement } from './availability-count-supplement'

describe('buildAvailabilityCountSupplement', () => {
  it('always renders the stable master-detail count line', () => {
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

    expect(screen.getByText('13 available · 0 unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Show/i })).not.toBeInTheDocument()
  })

  it('shows Show/Hide only when unavailable rows exist', async () => {
    const user = userEvent.setup()
    const onShow = vi.fn()
    const onHide = vi.fn()

    const { rerender } = render(
      <>
        {buildAvailabilityCountSupplement({
          scope: { availableCount: 12, unavailableCount: 1, visibleCount: 12 },
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
          scope: { availableCount: 12, unavailableCount: 1, visibleCount: 13 },
          showUnavailable: true,
          layout: 'stable',
          onShow,
          onHide,
        })}
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Hide unavailable items' }))
    expect(onHide).toHaveBeenCalledOnce()
  })

  it('omits the conditional overview count line when nothing is hidden', () => {
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
})
