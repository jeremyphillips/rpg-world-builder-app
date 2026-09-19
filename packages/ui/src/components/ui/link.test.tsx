import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Link } from './link'

describe('Link', () => {
  it('defaults to an inline accent link', () => {
    render(<Link href="/docs">Rules</Link>)

    const link = screen.getByRole('link', { name: 'Rules' })
    expect(link).toHaveClass('text-action-inline', 'text-primary')
    expect(link).not.toHaveClass('text-action-standalone')
  })

  it('supports standalone neutral text actions', () => {
    render(
      <Link href="/somewhere" context="standalone" tone="neutral">
        View something
      </Link>,
    )

    const link = screen.getByRole('link', { name: 'View something' })
    expect(link).toHaveClass('text-action-standalone', 'text-foreground')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Link href="/docs">Rules</Link>)
    await expectNoAxeViolations(container)
  })
})
