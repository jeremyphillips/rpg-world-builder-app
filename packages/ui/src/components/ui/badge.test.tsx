import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  it('renders a span by default', () => {
    render(
      <Badge appearance="soft" tone="informative">
        System
      </Badge>,
    )
    expect(screen.getByText('System').tagName).toBe('SPAN')
  })

  it('applies appearance and tone classes', () => {
    render(
      <Badge appearance="outline" tone="caution" size="sm">
        Stale
      </Badge>,
    )
    const el = screen.getByText('Stale')
    expect(el).toHaveClass('text-foreground', 'border-semantic-caution-border', 'font-light')
    expect(el).toHaveClass('text-xs-meta', 'rounded-full')
  })

  it('uses font-medium for filled soft appearance', () => {
    render(
      <Badge appearance="soft" tone="negative">
        Error
      </Badge>,
    )
    expect(screen.getByText('Error')).toHaveClass('font-medium', 'bg-semantic-negative-subtle')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Badge appearance="neutral" tone="neutral">
        Homebrew
      </Badge>,
    )
    await expectNoAxeViolations(container)
  })
})
