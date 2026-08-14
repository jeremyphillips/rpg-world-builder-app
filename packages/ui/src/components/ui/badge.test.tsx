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
    expect(el).toHaveClass(
      'text-semantic-warning-outline-foreground',
      'border-semantic-warning-border',
      'border-[1.5px]',
      'font-medium',
      'h-[22px]',
    )
    expect(el).toHaveClass('text-xs-meta', 'rounded-full')
  })

  it('uses token-owned soft destructive foreground', () => {
    render(
      <Badge appearance="soft" tone="destructive">
        Error
      </Badge>,
    )
    expect(screen.getByText('Error')).toHaveClass(
      'font-medium',
      'bg-semantic-destructive-soft',
      'text-semantic-destructive-soft-foreground',
    )
  })

  it('uses strong appearance fill roles', () => {
    render(
      <Badge appearance="strong" tone="info">
        Essential
      </Badge>,
    )
    expect(screen.getByText('Essential')).toHaveClass(
      'bg-semantic-info-strong',
      'text-semantic-info-strong-foreground',
    )
  })

  it('uses counter layout for compact numeric badges', () => {
    render(
      <Badge appearance="soft" tone="destructive" size="sm" layout="counter">
        2
      </Badge>,
    )
    expect(screen.getByText('2')).toHaveClass(
      'min-w-5',
      'justify-center',
      'px-1',
      'tabular-nums',
      'leading-none',
    )
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Badge appearance="soft" tone="neutral">
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
