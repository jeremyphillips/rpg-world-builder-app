import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Text } from './text'

describe('Text', () => {
  it('renders as a paragraph by default', () => {
    render(<Text variant="muted">Description</Text>)
    expect(screen.getByText('Description').tagName).toBe('P')
  })

  it('supports polymorphic rendering', () => {
    render(
      <Text variant="destructive" as="span" role="alert">
        Error
      </Text>,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Error')
    expect(alert.tagName).toBe('SPAN')
    expect(alert).toHaveClass('text-style-destructive')
  })

  it('applies body-compact variant classes', () => {
    render(<Text variant="body-compact">Mechanics</Text>)
    expect(screen.getByText('Mechanics')).toHaveClass('text-style-body-compact')
  })

  it('applies supporting and label variant classes', () => {
    render(<Text variant="supporting">Supporting</Text>)
    expect(screen.getByText('Supporting')).toHaveClass('text-style-supporting')
    render(<Text variant="label">Label</Text>)
    expect(screen.getByText('Label')).toHaveClass('text-style-label')
  })

  it('applies micro variant classes on span owners', () => {
    render(
      <Text as="span" variant="micro">
        Status
      </Text>,
    )
    expect(screen.getByText('Status')).toHaveClass('text-style-micro')
    expect(screen.getByText('Status').tagName).toBe('SPAN')
  })

  it('applies status variant classes', () => {
    render(<Text variant="warning">Caution</Text>)
    expect(screen.getByText('Caution')).toHaveClass('text-style-warning')
  })

  it('keeps a tone class when className sets a size', () => {
    render(
      <Text variant="destructive" className="text-sm">
        Sized error
      </Text>,
    )
    const error = screen.getByText('Sized error')
    expect(error).toHaveClass('text-style-destructive', 'text-sm')

    render(
      <Text variant="warning" className="text-xs">
        Sized caution
      </Text>,
    )
    expect(screen.getByText('Sized caution')).toHaveClass('text-style-warning', 'text-xs')
  })

  it('lets a later color utility replace a color-only role', () => {
    render(
      <Text variant="body" className="text-destructive">
        Recolored
      </Text>,
    )
    const recolored = screen.getByText('Recolored')
    expect(recolored).toHaveClass('text-destructive')
    expect(recolored).not.toHaveClass('text-style-body')

    render(
      <Text variant="body" className="text-sm text-destructive">
        Sized recolor
      </Text>,
    )
    const sized = screen.getByText('Sized recolor')
    expect(sized).toHaveClass('text-sm', 'text-destructive')
    expect(sized).not.toHaveClass('text-style-body')
  })

  it('keeps a size-setting role beside a text color', () => {
    render(
      <Text variant="body-compact" className="text-destructive">
        Compact
      </Text>,
    )
    expect(screen.getByText('Compact')).toHaveClass('text-style-body-compact', 'text-destructive')

    render(
      <Text variant="caption" className="text-destructive">
        Caption
      </Text>,
    )
    expect(screen.getByText('Caption')).toHaveClass('text-style-caption', 'text-destructive')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Text variant="body">Body copy.</Text>)
    await expectNoAxeViolations(container)
  })
})
