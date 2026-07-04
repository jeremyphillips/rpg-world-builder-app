import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

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
    expect(alert).toHaveClass('text-destructive')
  })

  it('applies variant classes', () => {
    render(<Text variant="small">Hint</Text>)
    expect(screen.getByText('Hint')).toHaveClass('text-md', 'text-muted-foreground')
  })

  it('applies status variant classes', () => {
    render(<Text variant="warning">Caution</Text>)
    expect(screen.getByText('Caution')).toHaveClass('text-warning')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Text variant="body">Body copy.</Text>)
    await expectNoAxeViolations(container)
  })
})
