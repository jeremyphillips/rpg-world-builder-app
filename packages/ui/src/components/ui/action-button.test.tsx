import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ActionButton } from './action-button.client'

describe('ActionButton', () => {
  it('renders the registry glyph and visible label', () => {
    const { container } = render(
      <ActionButton action="add" variant="outline">
        Add row
      </ActionButton>,
    )

    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument()
    expect(container.querySelector('svg.lucide-plus')).toBeTruthy()
  })

  it('forwards aria-label for icon-only buttons', () => {
    render(<ActionButton action="edit" variant="ghost" size="icon" aria-label="Edit entry" />)

    expect(screen.getByRole('button', { name: 'Edit entry' })).toBeInTheDocument()
  })

  it('sizes the glyph for dense text xs actions', () => {
    const { container } = render(
      <ActionButton action="reset" variant="text" size="xs" density="compact">
        Reset
      </ActionButton>,
    )

    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('size-icon-glyph-xs')
    expect(svg).not.toHaveClass('size-icon-glyph-lg')
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
