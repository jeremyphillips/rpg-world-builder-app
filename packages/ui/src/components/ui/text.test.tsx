import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

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
    expect(screen.getByText('Hint')).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<Text variant="body">Body copy.</Text>)
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
