import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button.client'
import { PreviewCard } from './preview-card.client'

describe('PreviewCard', () => {
  it('renders title, eyebrow, and description', () => {
    render(
      <PreviewCard
        eyebrow="Spell"
        title="Fireball"
        description="Homebrew"
        footerSlot={<span>Recommended</span>}
      />,
    )

    expect(screen.getByText('Spell')).toBeInTheDocument()
    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
    expect(screen.getByText('Recommended')).toBeInTheDocument()
  })

  it('renders description inline when requested', () => {
    render(<PreviewCard title="Fireball" description="Homebrew" descriptionInline />)
    expect(screen.getByText('Fireball', { exact: false }).parentElement).toHaveTextContent(
      'Fireball Homebrew',
    )
  })

  it('uses a button root when onSelect is provided', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <PreviewCard eyebrow="Spell" title="Fireball" description="Homebrew" onSelect={onSelect} />,
    )

    const button = screen.getByRole('button', { name: /Spell Fireball Homebrew/i })
    expect(button.tagName).toBe('BUTTON')
    await user.click(button)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('uses a div root when onSelect is omitted so endSlot controls stay valid', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()

    const { container } = render(
      <PreviewCard
        layout="card"
        eyebrow="Spell"
        title="Fireball"
        description="Homebrew"
        endSlot={
          <Button type="button" aria-label="Clear selection" onClick={onClear}>
            Clear
          </Button>
        }
      />,
    )

    expect(container.firstElementChild?.tagName).toBe('DIV')
    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('uses list note styling for availability copy by default', () => {
    render(
      <PreviewCard
        title="Healing"
        description="Roll-based healing (e.g. 2d8 healing)."
        footerSlot="Not available with ranged spell resolution"
      />,
    )

    const note = screen.getByText('Not available with ranged spell resolution')
    expect(note).toHaveClass('text-xs')
    expect(note).toHaveClass('italic')
    expect(screen.getByText('Healing')).toHaveClass('text-sm')
    expect(screen.getByText('Healing')).toHaveClass('mb-1')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <PreviewCard
        eyebrow="Spell"
        title="Fireball"
        description="Homebrew"
        onSelect={() => undefined}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
