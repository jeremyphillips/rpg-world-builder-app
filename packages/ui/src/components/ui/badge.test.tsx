import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { Badge } from './badge'

describe('Badge', () => {
  it('renders a span by default', () => {
    render(
      <Badge appearance="soft" tone="info">
        System
      </Badge>,
    )
    expect(screen.getByText('System').tagName).toBe('SPAN')
  })

  it('applies appearance and tone classes', () => {
    render(
      <Badge appearance="outline" tone="warning" size="sm">
        Stale
      </Badge>,
    )
    const el = screen.getByText('Stale')
    expect(el).toHaveClass('text-foreground', 'border-semantic-warning-border', 'font-light')
    expect(el).toHaveClass('text-xs-meta', 'rounded-full')
  })

  it('uses font-medium for filled soft appearance', () => {
    render(
      <Badge appearance="soft" tone="destructive">
        Error
      </Badge>,
    )
    expect(screen.getByText('Error')).toHaveClass(
      'font-medium',
      'bg-semantic-destructive-subtle',
      'text-semantic-destructive-on-subtle',
    )
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Badge appearance="neutral" tone="neutral">
        Homebrew
      </Badge>,
    )
    await expectNoAxeViolations(container)
  })

  it('has no accessibility violations for soft negative on card surface', async () => {
    const { container } = render(
      <div className="rounded-lg bg-card p-4">
        <Badge appearance="soft" tone="destructive">
          Error
        </Badge>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
