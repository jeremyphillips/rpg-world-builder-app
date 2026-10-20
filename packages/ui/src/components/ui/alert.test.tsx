import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { Button } from './button.client'
import { Alert } from './alert'
import { ALERT_DENSITIES, ALERT_VARIANTS } from './alert.variants'

describe('Alert', () => {
  it('renders title and description with role="alert" by default', () => {
    render(
      <Alert
        variant="warning"
        title="Subclass choices are disabled"
        description="Enable subclasses to prompt players."
      />,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Subclass choices are disabled')
    expect(alert).toHaveTextContent('Enable subclasses to prompt players.')
    expect(alert).toHaveClass('ui-alert--warning')
  })

  it('renders optional actions below copy', () => {
    render(
      <Alert
        variant="warning"
        title="Subclass choices are disabled"
        actions={<Button size="sm">Enable subclasses</Button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Enable subclasses' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Enable subclasses' }).closest('.ui-alert__actions'),
    ).toBeTruthy()
  })

  it.each(ALERT_VARIANTS)('applies the %s variant classes', (variant) => {
    render(<Alert variant={variant} title="Status" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass(`ui-alert--${variant}`)
  })

  it('applies comfortable density by default', () => {
    render(<Alert title="Status" />)
    expect(screen.getByRole('alert')).toHaveClass('ui-alert--comfortable')
    expect(screen.getByText('Status')).toHaveClass('ui-copy-title')
  })

  it('applies compact and spacious density modifiers', () => {
    const { rerender } = render(<Alert density="compact" title="Status" description="Details" />)
    expect(screen.getByRole('alert')).toHaveClass('ui-alert--compact')

    rerender(<Alert density="spacious" title="Status" description="Details" />)
    expect(screen.getByRole('alert')).toHaveClass('ui-alert--spacious')
  })

  it.each(ALERT_DENSITIES)('uses shared copy scale at %s density', (density) => {
    render(<Alert density={density} title="Status" description="Details" />)
    expect(screen.getByText('Status')).toHaveClass('ui-copy-title')
    expect(screen.getByText('Details')).toHaveClass('ui-copy-supporting')
  })

  it('supports announcement="none" for persistent copy', () => {
    render(
      <Alert announcement="none" variant="warning" title="Finish joining" description="Setup" />,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByText('Finish joining')).toBeInTheDocument()
  })

  it('supports announcement="status"', () => {
    render(<Alert announcement="status" title="Saved" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders optional leading content', () => {
    render(<Alert leading={<span data-testid="leading-icon" />} title="Status" />)
    expect(screen.getByTestId('leading-icon').closest('.ui-alert__leading')).toBeTruthy()
  })

  it('uses an 8px gap between title and description', () => {
    render(<Alert title="Status" description="Details" />)
    expect(screen.getByText('Status').parentElement).toHaveClass('ui-alert__copy')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <Alert
        variant="warning"
        title="Subclass choices are disabled"
        description="Enable subclasses to prompt players."
        actions={<Button size="sm">Enable subclasses</Button>}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
