import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'

import { AvailabilityBadge } from './availability-badge.client'

describe('AvailabilityBadge', () => {
  it('renders nothing when availability is active', () => {
    const { container } = render(<AvailabilityBadge availability={{ status: 'active' }} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the inactive badge label', () => {
    render(
      <AvailabilityBadge
        availability={{
          status: 'inactive',
          reasons: [
            { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
          ],
        }}
      />,
    )
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <AvailabilityBadge
        availability={{
          status: 'inactive',
          reasons: [
            { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
          ],
        }}
      />,
    )
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
