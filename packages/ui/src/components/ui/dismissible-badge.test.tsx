import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { DismissibleBadge } from './dismissible-badge.client'

describe('DismissibleBadge', () => {
  it('renders the label', () => {
    render(<DismissibleBadge label="Dagger" onDismiss={vi.fn()} />)
    expect(screen.getByText('Dagger')).toBeInTheDocument()
  })

  it('calls onDismiss when the dismiss control is clicked', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(<DismissibleBadge label="Dagger" onDismiss={onDismiss} />)

    await user.click(screen.getByRole('button', { name: 'Remove Dagger' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('uses a custom dismiss aria-label when provided', () => {
    render(
      <DismissibleBadge label="Dagger" dismissLabel="Remove weapon Dagger" onDismiss={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Remove weapon Dagger' })).toBeInTheDocument()
  })

  it('disables the dismiss control when disabled', () => {
    render(<DismissibleBadge label="Dagger" onDismiss={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: 'Remove Dagger' })).toBeDisabled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DismissibleBadge label="Dagger" onDismiss={vi.fn()} />)
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
