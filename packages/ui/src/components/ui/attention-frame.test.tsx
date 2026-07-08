import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  ATTENTION_FRAME_DURATION_MS,
  ATTENTION_FRAME_REDUCED_MOTION_HOLD_MS,
  AttentionFrame,
} from './attention-frame.client'

describe('AttentionFrame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies active attention classes when active', () => {
    const { container } = render(
      <AttentionFrame active className="p-4">
        <p>Dependent choice</p>
      </AttentionFrame>,
    )

    expect(container.firstChild).toHaveClass('border-primary')
    expect(container.firstChild).toHaveClass('motion-safe:animate-attention-ring')
  })

  it('calls onAttentionComplete after the default duration', () => {
    const onAttentionComplete = vi.fn()
    render(
      <AttentionFrame active onAttentionComplete={onAttentionComplete}>
        <p>Dependent choice</p>
      </AttentionFrame>,
    )

    expect(onAttentionComplete).not.toHaveBeenCalled()
    vi.advanceTimersByTime(ATTENTION_FRAME_DURATION_MS)
    expect(onAttentionComplete).toHaveBeenCalledTimes(1)
  })

  it('uses a short hold when reduced motion is preferred', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )

    const onAttentionComplete = vi.fn()
    render(
      <AttentionFrame active onAttentionComplete={onAttentionComplete}>
        <p>Dependent choice</p>
      </AttentionFrame>,
    )

    vi.advanceTimersByTime(ATTENTION_FRAME_REDUCED_MOTION_HOLD_MS)
    expect(onAttentionComplete).toHaveBeenCalledTimes(1)
  })

  it('renders children', () => {
    render(
      <AttentionFrame>
        <p>Dependent choice</p>
      </AttentionFrame>,
    )

    expect(screen.getByText('Dependent choice')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    vi.useRealTimers()
    const { container } = render(
      <AttentionFrame active>
        <p>Dependent choice</p>
      </AttentionFrame>,
    )
    await expectNoAxeViolations(container)
  })
})
