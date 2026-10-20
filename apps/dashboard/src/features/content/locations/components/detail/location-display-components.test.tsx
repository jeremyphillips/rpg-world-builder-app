import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { buildLocationDetailViewModel } from '../../lib/location-display'
import { HARBORFORD, LOCATIONS_LIST } from '../../fixtures'
import { LocationDetailIdentity } from './location-detail-identity'
import { EntityCard } from '@/features/content'

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

describe('EntityCardStaticRenderer (location rows)', () => {
  it('renders title and summary line', () => {
    render(
      <MemoryRouter>
        <EntityCard entity={{ heading: 'Dock Ward', description: 'District' }} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Dock Ward')).toBeInTheDocument()
    expect(screen.getByText('District')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <EntityCard entity={{ heading: 'Dock Ward', description: 'District' }} />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
