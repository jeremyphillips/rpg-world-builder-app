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
    expect(alert).toHaveClass('border-warning-muted', 'bg-warning-subtle')
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
    if (variant === 'default') {
      expect(alert).toHaveClass('border-border', 'bg-surface-muted')
      expect(alert).toHaveClass('[--surface-current:var(--surface-muted)]')
      return
    }
    expect(alert).toHaveClass(`border-${variant}-muted`, `bg-${variant}-subtle`)
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
