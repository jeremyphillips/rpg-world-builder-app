import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Spinner } from './spinner'

describe('Spinner', () => {
  it('renders an accessible loading status', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('defaults to muted variant and default size', () => {
    render(<Spinner />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toHaveClass('text-muted-foreground')
    expect(spinner).toHaveClass('size-4')
  })

  it('applies variant and size props', () => {
    render(<Spinner variant="foreground" size="xl" />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toHaveClass('text-foreground')
    expect(spinner).toHaveClass('size-8')
  })

  it('merges custom className', () => {
    render(<Spinner className="opacity-50" />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toHaveClass('opacity-50')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Spinner />)
    await expectNoAxeViolations(container)
  })
})
