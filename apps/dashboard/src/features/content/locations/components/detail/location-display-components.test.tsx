import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { buildLocationDetailViewModel } from '../../lib/location-display'
import { HARBORFORD, LOCATIONS_LIST } from '../../fixtures'
import { LocationDetailIdentity } from './location-detail-identity.client'
import { ContentEntityCard } from '../../../lib/content-entity-card.client'

describe('LocationDetailIdentity', () => {
  it('renders identity rows and located-in links', () => {
    const identity = buildLocationDetailViewModel(HARBORFORD, {
      locations: LOCATIONS_LIST,
      campaignId: 'camp_1',
    }).identity

    render(
      <MemoryRouter>
        <LocationDetailIdentity identity={identity} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Settlement')).toBeInTheDocument()
    expect(screen.getByText('Located in')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Greyshore' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const identity = buildLocationDetailViewModel(HARBORFORD, {
      locations: LOCATIONS_LIST,
      campaignId: 'camp_1',
    }).identity

    const { container } = render(
      <MemoryRouter>
        <LocationDetailIdentity identity={identity} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})

describe('ContentEntityCard (location rows)', () => {
  it('renders linked title and summary line', () => {
    render(
      <MemoryRouter>
        <ContentEntityCard
          entity={{ heading: 'Dock Ward', description: 'District' }}
          headingHref="/campaigns/camp_1/locations/location-dock-ward"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Dock Ward' })).toBeInTheDocument()
    expect(screen.getByText('District')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <ContentEntityCard entity={{ heading: 'Dock Ward', description: 'District' }} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
