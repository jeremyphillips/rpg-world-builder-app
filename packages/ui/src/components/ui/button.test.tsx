import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { Button } from './button'

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
    // color-contrast relies on canvas, which jsdom does not implement; it is
    // covered instead by Storybook's addon-a11y in a real browser.
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
