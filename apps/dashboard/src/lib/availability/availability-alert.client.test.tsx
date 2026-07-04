import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { AvailabilityAlert } from './availability-alert.client'
import { resolveAvailability } from './availability'

function renderAlert(
  availability = resolveAvailability([
    { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
  ]),
) {
  return render(
    <MemoryRouter>
      <AvailabilityAlert availability={availability} context={{ campaignId: 'camp_1' }} />
    </MemoryRouter>,
  )
}

describe('AvailabilityAlert', () => {
  it('renders a single reason with registry copy and action', () => {
    renderAlert()

    expect(screen.getByRole('alert')).toHaveTextContent('Subclass choices are disabled')
    expect(
      screen.getByText(/characters will not be prompted to choose a subclass/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enable subclasses' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    )
  })

  it('renders a generic title and bullet list for multiple reasons', () => {
    render(
      <MemoryRouter>
        <AvailabilityAlert
          availability={resolveAvailability([
            { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
            { code: 'not-available-in-campaign' },
          ])}
          context={{ campaignId: 'camp_1' }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Inactive for this campaign')).toBeInTheDocument()
    expect(screen.getByText('Subclass choices are disabled')).toBeInTheDocument()
    expect(screen.getByText('Not active in this campaign')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enable subclasses' })).toBeInTheDocument()
  })

  it('renders nothing for active availability', () => {
    const { container } = render(
      <MemoryRouter>
        <AvailabilityAlert availability={{ status: 'active' }} context={{ campaignId: 'camp_1' }} />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderAlert()
    await expectNoAxeViolations(container)
  })
})
