import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { Eyebrow } from './eyebrow'

describe('Eyebrow', () => {
  it('defaults to sm size composite', () => {
    render(<Eyebrow>Campaign</Eyebrow>)
    const eyebrow = screen.getByText('Campaign')
    expect(eyebrow).toHaveClass('eyebrow-style-sm', 'text-muted-foreground')
  })

  it('applies md size composite', () => {
    render(<Eyebrow size="md">Overview</Eyebrow>)
    expect(screen.getByText('Overview')).toHaveClass('eyebrow-style-md', 'text-muted-foreground')
  })

  it('applies xs size composite', () => {
    render(<Eyebrow size="xs">Spell</Eyebrow>)
    expect(screen.getByText('Spell')).toHaveClass('eyebrow-style-xs', 'text-muted-foreground')
  })

  it('applies foreground tone', () => {
    render(
      <Eyebrow size="xs" tone="foreground">
        Recommended
      </Eyebrow>,
    )
    expect(screen.getByText('Recommended')).toHaveClass('eyebrow-style-xs', 'text-foreground')
  })

  it('applies primary tone', () => {
    render(
      <Eyebrow size="sm" tone="primary">
        Featured
      </Eyebrow>,
    )
    expect(screen.getByText('Featured')).toHaveClass('eyebrow-style-sm', 'text-primary')
  })

  it('renders as a span when nested inside phrasing-only parents', () => {
    render(
      <Eyebrow as="span" size="sm">
        Level 1
      </Eyebrow>,
    )
    const eyebrow = screen.getByText('Level 1')
    expect(eyebrow.tagName).toBe('SPAN')
    expect(eyebrow).toHaveClass('eyebrow-style-sm', 'text-muted-foreground')
  })

  it('merges custom className', () => {
    render(<Eyebrow className="px-3 pb-1 pt-3">Navigation</Eyebrow>)
    expect(screen.getByText('Navigation')).toHaveClass('px-3', 'pb-1', 'pt-3')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Eyebrow>Section</Eyebrow>)
    await expectNoAxeViolations(container)
  })
})
