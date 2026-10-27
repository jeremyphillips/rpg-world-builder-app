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

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<Text variant="body">Body copy.</Text>)
    await expectNoAxeViolations(container)
  })
})
