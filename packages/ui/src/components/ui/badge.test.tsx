import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { cn } from '../../lib/utils'
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
      <Badge appearance="outline" tone="warning" size="sm" className="caller-badge">
        Stale
      </Badge>,
    )
    const el = screen.getByText('Stale')
    expect(el).toHaveClass('ui-pill', 'ui-badge', 'ui-badge--sm', 'ui-badge--outline-warning')
    expect(el).toHaveClass('caller-badge')
  })

  it('forwards ui-badge onto an asChild root', () => {
    render(
      <Badge asChild appearance="outline" tone="neutral">
        <a href="/spells/1">Fireball</a>
      </Badge>,
    )
    const link = screen.getByRole('link', { name: 'Fireball' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveClass('ui-pill', 'ui-badge', 'ui-badge--outline-neutral')
  })

  it('uses token-owned soft destructive foreground', () => {
    render(
      <Badge appearance="soft" tone="destructive">
        Error
      </Badge>,
    )
    expect(screen.getByText('Error')).toHaveClass('ui-badge--soft-destructive')
  })

  it('uses strong appearance fill roles', () => {
    render(
      <Badge appearance="strong" tone="info">
        Essential
      </Badge>,
    )
    expect(screen.getByText('Essential')).toHaveClass('ui-badge--strong-info')
  })

  it('mutes subdued emphasis without a disabled well', () => {
    render(
      <Badge appearance="soft" tone="neutral" emphasis="subdued">
        Complete
      </Badge>,
    )
    const el = screen.getByText('Complete')
    expect(el).toHaveClass('ui-badge--subdued', 'ui-badge--soft-neutral')
    expect(el).not.toHaveClass('ui-badge--strong-neutral')
    expect(el.className).not.toContain('text-foreground-disabled')
    expect(el).not.toHaveAttribute('aria-disabled')
  })

  it('uses counter layout for compact numeric badges', () => {
    render(
      <Badge appearance="soft" tone="destructive" size="sm" layout="counter">
        2
      </Badge>,
    )
    expect(screen.getByText('2')).toHaveClass('ui-badge--sm', 'ui-badge--counter')
  })

  it('keeps appearance, emphasis, counter, and size independently mergeable', () => {
    const together = cn(
      'ui-badge--sm',
      'ui-badge--soft-destructive',
      'ui-badge--subdued',
      'ui-badge--counter',
    )
    expect(together).toContain('ui-badge--sm')
    expect(together).toContain('ui-badge--soft-destructive')
    expect(together).toContain('ui-badge--subdued')
    expect(together).toContain('ui-badge--counter')

    expect(cn('ui-badge--outline-neutral', 'ui-badge--soft-info')).toBe('ui-badge--soft-info')
    expect(cn('ui-badge--sm', 'ui-badge--lg')).toBe('ui-badge--lg')
    expect(cn('ui-badge--lg', 'ui-badge--subdued', 'ui-badge--counter')).toContain('ui-badge--lg')
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
