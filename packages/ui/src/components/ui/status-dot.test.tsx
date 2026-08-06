import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { StatusDot } from './status-dot'

describe('StatusDot', () => {
  it('renders a decorative dot by default', () => {
    const { container } = render(<StatusDot tone="info" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders an optional visible label', () => {
    render(<StatusDot tone="info" label="Unread" />)
    expect(screen.getByText('Unread')).toBeInTheDocument()
  })

  it('applies tone and size variants', () => {
    const { container } = render(<StatusDot tone="success" size="md" />)
    const dot = container.querySelector('[aria-hidden="true"]')
    expect(dot).toHaveClass('bg-semantic-success')
    expect(dot).toHaveClass('size-2.5')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<StatusDot tone="info" />)
    await expectNoAxeViolations(container)
  })
})
