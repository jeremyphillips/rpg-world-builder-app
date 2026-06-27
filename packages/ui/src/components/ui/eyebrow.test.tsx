import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { Eyebrow } from './eyebrow'

describe('Eyebrow', () => {
  it('defaults to sm size composite', () => {
    render(<Eyebrow>Campaign</Eyebrow>)
    const eyebrow = screen.getByText('Campaign')
    expect(eyebrow).toHaveClass('eyebrow-style-sm')
  })

  it('applies md size composite', () => {
    render(<Eyebrow size="md">Overview</Eyebrow>)
    expect(screen.getByText('Overview')).toHaveClass('eyebrow-style-md')
  })

  it('applies xs size composite', () => {
    render(<Eyebrow size="xs">Spell</Eyebrow>)
    expect(screen.getByText('Spell')).toHaveClass('eyebrow-style-xs')
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
