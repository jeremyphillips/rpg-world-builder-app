/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AdvisoryAlert } from './advisory-alert'

describe('AdvisoryAlert', () => {
  it.each([
    ['info', 'info', 'ui-alert--info'],
    ['warning', 'triangle-alert', 'ui-alert--warning'],
    ['error', 'circle-alert', 'ui-alert--destructive'],
  ] as const)('maps %s to its icon and alert variant', (tone, icon, variantClass) => {
    render(<AdvisoryAlert tone={tone} message={`${tone} note`} />)

    const alert = screen.getByText(`${tone} note`).closest('.ui-alert')
    expect(alert).toHaveClass('ui-alert--compact', variantClass)
    expect(alert).not.toHaveAttribute('role')
    expect(alert?.querySelector(`[data-icon="${icon}"]`)).toHaveAttribute('aria-hidden', 'true')
    expect(alert?.querySelector('[data-slot="alert-title"]')).toBeNull()
  })

  it('shows an optional title through the alert title slot', () => {
    render(<AdvisoryAlert tone="warning" title="Missing speed" message="No fly speed." />)

    expect(screen.getByText('Missing speed').closest('[data-slot="alert-title"]')).toBeTruthy()
    expect(
      screen.getByText('No fly speed.').closest('[data-slot="alert-description"]'),
    ).toBeTruthy()
  })
})
