import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
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

  itAxe('has no axe accessibility violations', async () => {
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
    await expectNoAxeViolations(container)
  })
})
