import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ArrowRight, Plus } from 'lucide-react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Button } from './button.client'
import { Spinner } from './spinner'
import { UI_BUTTON_TEXT_SIZE_CLASS } from './button.styles'

describe('Button', () => {
  it('renders its children as an accessible button', () => {
    render(<Button>Save world</Button>)
    expect(screen.getByRole('button', { name: 'Save world' })).toBeInTheDocument()
  })

  it('applies semantic appearance and size classes', () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('ui-button--destructive')
    expect(button).toHaveClass('ui-button--sm')
  })

  it('applies xs size classes for chrome and icon-xs', () => {
    const { rerender } = render(
      <Button size="xs" variant="outline">
        Reset
      </Button>,
    )
    const xsButton = screen.getByRole('button', { name: 'Reset' })
    expect(xsButton).toHaveClass('ui-button--xs', 'ui-button--outline')

    rerender(
      <Button size="icon-xs" variant="ghost" aria-label="Remove">
        <span aria-hidden>×</span>
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveClass('ui-button--icon-xs')
  })

  it('applies compact density size modifiers', () => {
    const { rerender } = render(
      <Button size="sm" density="compact">
        Compact
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('ui-button--sm-compact')

    rerender(
      <Button size="default" density="compact">
        Compact
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('ui-button--md-compact')

    rerender(
      <Button size="lg" density="compact">
        Compact
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact' })).toHaveClass('ui-button--lg-compact')

    rerender(
      <Button size="icon" density="compact" aria-label="Icon action">
        <span aria-hidden>+</span>
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Icon action' })).toHaveClass(
      'ui-button--icon-compact',
    )

    rerender(
      <Button size="icon-lg" aria-label="Large icon action">
        <span aria-hidden>+</span>
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Large icon action' })).toHaveClass(
      'ui-button--icon-lg',
    )
  })

  it('applies tier gap for leading icon, trailing icon, and spinner compositions', () => {
    const { rerender } = render(
      <Button size="xs" variant="outline">
        <Plus aria-hidden />
        Reset
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveClass('ui-button--xs')

    rerender(
      <Button size="sm" variant="outline">
        Next
        <ArrowRight aria-hidden />
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Next' })).toHaveClass('ui-button--sm')

    rerender(
      <Button size="default" variant="default" disabled>
        <Spinner size="sm" />
        <Plus aria-hidden />
        Saving
      </Button>,
    )
    expect(screen.getByRole('button', { name: /saving/i })).toHaveClass('ui-button--md')
  })

  it('attached variant fills a segment instead of using standalone button height', () => {
    render(
      <Button variant="attached" size="default">
        Generate
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Generate' })
    expect(button).toHaveClass(
      'ui-button--attached',
      'ui-button--attached-md',
      'ui-field-group__segment--end',
    )
    expect(button).not.toHaveClass('ui-button--md')
  })

  it('applies outline button appearance from semantic CSS', () => {
    render(<Button variant="outline">Cancel</Button>)
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button).toHaveClass('ui-button--outline')
    expect(button).not.toHaveClass('border-interactive-outline')
    expect(button).not.toHaveClass('shadow-sm')
  })

  it('applies expanded outline treatment when aria-expanded is true', () => {
    render(
      <Button variant="outline" aria-expanded>
        More filters
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'More filters' })
    expect(button).toHaveClass('ui-button--outline')
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies text variant geometry and standalone neutral recipe', () => {
    render(<Button variant="text">Add relationship</Button>)
    const button = screen.getByRole('button', { name: 'Add relationship' })
    expect(button).toHaveClass(UI_BUTTON_TEXT_SIZE_CLASS, 'ui-button__text--default')
    expect(button).toHaveClass('text-action-standalone', 'text-foreground')
    expect(button).not.toHaveClass('ui-button--primary')
  })

  it('applies compact text variant geometry', () => {
    render(
      <Button variant="text" density="compact">
        Compact text
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Compact text' })).toHaveClass(
      'ui-button__text--default-compact',
    )
  })

  it('applies accent tone on text variant when requested', () => {
    render(
      <Button variant="text" tone="accent">
        Choose class
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Choose class' })).toHaveClass('text-primary')
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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Button>Accessible</Button>)
    await expectNoAxeViolations(container)
  })
})
