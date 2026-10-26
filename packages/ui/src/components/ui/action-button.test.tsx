import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ActionButton } from './action-button.client'
import { ACTION_ICONS } from './action-icons.map'
import type { ButtonSize } from './button.variants'

const EXPLICIT_ICON_STEPS = [
  'ui-icon--xs',
  'ui-icon--sm',
  'ui-icon--md',
  'ui-icon--lg',
  'ui-icon--xl',
  'ui-icon--2xl',
  'ui-icon--3xl',
] as const

const ACTION_BUTTON_SIZE_HOSTS = [
  { size: 'xs', host: 'ui-button--xs', label: 'Add' },
  { size: 'sm', host: 'ui-button--sm', label: 'Add' },
  { size: 'default', host: 'ui-button--md', label: 'Add' },
  { size: 'lg', host: 'ui-button--lg', label: 'Add' },
  { size: 'icon-xs', host: 'ui-button--icon-xs' },
  { size: 'icon-sm', host: 'ui-button--icon-sm' },
  { size: 'icon', host: 'ui-button--icon-md' },
  { size: 'icon-lg', host: 'ui-button--icon-lg' },
] as const satisfies readonly {
  size: ButtonSize
  host: string
  label?: string
}[]

describe('ActionButton', () => {
  it('renders the registry glyph and visible label', () => {
    const { container } = render(
      <ActionButton action="add" variant="outline">
        Add row
      </ActionButton>,
    )

    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'plus')
  })

  it('maps details to the info glyph', () => {
    expect(ACTION_ICONS.details).toBe('info')
  })

  it('names icon-only details as View details when aria-label is omitted', () => {
    render(<ActionButton action="details" variant="text" tone="neutral" size="icon-xs" />)

    const button = screen.getByRole('button', { name: 'View details' })
    expect(button).toHaveAttribute('type', 'button')
    button.focus()
    expect(button).toHaveFocus()
  })

  it('keeps an explicit details aria-label', () => {
    render(
      <ActionButton
        action="details"
        variant="text"
        tone="neutral"
        size="icon-xs"
        aria-label="View Dwarf details"
      />,
    )

    expect(screen.getByRole('button', { name: 'View Dwarf details' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'View details' })).not.toBeInTheDocument()
  })

  it('forwards aria-label for icon-only buttons', () => {
    render(<ActionButton action="edit" variant="ghost" size="icon" aria-label="Edit entry" />)

    expect(screen.getByRole('button', { name: 'Edit entry' })).toBeInTheDocument()
  })

  it('sizes the glyph for dense text xs actions', () => {
    const { container } = render(
      <ActionButton action="reset" variant="text" size="xs">
        Reset
      </ActionButton>,
    )

    const button = screen.getByRole('button', { name: /reset/i })
    expect(button).toHaveClass('ui-button__text--xs')
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('ui-icon--owner')
    expect(svg).not.toHaveClass('ui-icon--lg')
  })

  it('resolves each size from the host class and an owner glyph', () => {
    for (const entry of ACTION_BUTTON_SIZE_HOSTS) {
      const { unmount, container } = render(
        entry.label ? (
          <ActionButton action="add" variant="outline" size={entry.size}>
            {entry.label}
          </ActionButton>
        ) : (
          <ActionButton action="edit" variant="ghost" size={entry.size} aria-label="Edit" />
        ),
      )

      const button = screen.getByRole('button', { name: entry.label ?? 'Edit' })
      expect(button, entry.size).toHaveClass(entry.host)
      const svg = container.querySelector('svg')
      expect(svg, entry.size).toHaveClass('ui-icon--owner')
      for (const step of EXPLICIT_ICON_STEPS) {
        expect(svg, entry.size).not.toHaveClass(step)
      }
      unmount()
    }
  })

  it('allows type="submit" to override the default button type', () => {
    render(
      <ActionButton action="add" type="submit">
        Save
      </ActionButton>,
    )

    expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute('type', 'submit')
  })
})
