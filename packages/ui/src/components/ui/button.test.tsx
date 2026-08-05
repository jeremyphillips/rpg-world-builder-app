import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { Button } from './button.client'

describe('Button', () => {
  it('renders its children as an accessible button', () => {
    render(<Button>Save world</Button>)
    expect(screen.getByRole('button', { name: 'Save world' })).toBeInTheDocument()
  })

  it('applies the variant and size classes', () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive')
    expect(button).toHaveClass('h-8')
  })

  it('applies compact density heights for each size', () => {
    const { rerender } = render(
      <Button size="sm" density="compact">
        Compact
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('h-control-action-compact')

    rerender(
      <Button size="default" density="compact">
        Compact
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('h-8')

    rerender(
      <Button size="lg" density="compact">
        Compact
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('h-9')

    rerender(
      <Button size="icon" density="compact" aria-label="Icon action">
        <span aria-hidden>+</span>
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Icon action' })).toHaveClass(
      'size-control-action-compact',
      '[&_svg]:size-icon-glyph-md',
    )

    rerender(
      <Button size="icon-lg" aria-label="Large icon action">
        <span aria-hidden>+</span>
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Large icon action' })).toHaveClass(
      'size-control-action-lg',
      '[&_svg]:size-icon-glyph-lg',
    )
  })

  it('applies outline button chrome from token recipes', () => {
    render(<Button variant="outline">Cancel</Button>)
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button).toHaveClass('border-interactive-outline')
    expect(button).toHaveClass('hover:bg-interactive-outline-hover')
    expect(button).not.toHaveClass('shadow-sm')
    expect(button).not.toHaveClass('border-input')
  })

  it('applies expanded outline treatment when aria-expanded is true', () => {
    render(
      <Button variant="outline" aria-expanded>
        More filters
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'More filters' })
    expect(button).toHaveClass('aria-expanded:border-border')
    expect(button).toHaveClass('aria-expanded:bg-interactive-outline-active')
  })

  it('fires onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Click' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Click' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Button>Accessible</Button>)
    await expectNoAxeViolations(container)
  })
})
