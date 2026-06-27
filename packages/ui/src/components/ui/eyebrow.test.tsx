import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { Eyebrow } from './eyebrow'

describe('Eyebrow', () => {
  it('defaults to sm size classes', () => {
    render(<Eyebrow>Campaign</Eyebrow>)
    const eyebrow = screen.getByText('Campaign')
    expect(eyebrow).toHaveClass(
      'text-eyebrow-sm',
      'font-light',
      'uppercase',
      'tracking-eyebrow',
      'text-muted-foreground',
    )
  })

  it('applies md size classes', () => {
    render(<Eyebrow size="md">Overview</Eyebrow>)
    expect(screen.getByText('Overview')).toHaveClass('text-eyebrow-md', 'tracking-eyebrow')
  })

  it('applies xs size classes with tighter tracking', () => {
    render(<Eyebrow size="xs">Spell</Eyebrow>)
    expect(screen.getByText('Spell')).toHaveClass('text-eyebrow-xs', 'tracking-eyebrow-xs')
  })

  it('merges custom className', () => {
    render(<Eyebrow className="px-3 pb-1 pt-3">Navigation</Eyebrow>)
    expect(screen.getByText('Navigation')).toHaveClass('px-3', 'pb-1', 'pt-3')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Eyebrow>Section</Eyebrow>)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})
