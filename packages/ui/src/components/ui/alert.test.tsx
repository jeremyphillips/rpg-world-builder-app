import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { Button } from './button.client'
import { Alert } from './alert'
import { ALERT_VARIANTS } from './alert.variants'

describe('Alert', () => {
  it('renders title and description with role="alert"', () => {
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

  it('renders optional actions', () => {
    render(
      <Alert
        variant="warning"
        title="Subclass choices are disabled"
        actions={<Button size="sm">Enable subclasses</Button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Enable subclasses' })).toBeInTheDocument()
  })

  it.each(ALERT_VARIANTS)('applies the %s variant classes', (variant) => {
    render(<Alert variant={variant} title="Status" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass(`ui-alert--${variant}`)
  })

  it('applies comfortable density by default', () => {
    render(<Alert title="Status" />)
    expect(screen.getByRole('alert')).toHaveClass('ui-alert--comfortable')
    expect(screen.getByText('Status')).toHaveClass('ui-alert__title--comfortable')
  })

  it('applies compact density padding and title sizing', () => {
    render(<Alert density="compact" title="Status" description="Details" />)
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('ui-alert--compact')
    expect(screen.getByText('Status')).toHaveClass('ui-alert__title--compact')
    expect(screen.getByText('Details')).toHaveClass('ui-alert__description')
  })

  it('uses an 8px gap between title and description', () => {
    render(<Alert title="Status" description="Details" />)
    expect(screen.getByText('Status').parentElement).toHaveClass('gap-2')
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
