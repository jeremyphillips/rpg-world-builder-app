import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CITY_COUNCIL } from '@/features/content'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../../lib/display/character-display'
import { CharacterOrganizationsSummary } from './character-organizations-summary.client'

describe('CharacterOrganizationsSummary', () => {
  it('renders organization links and hides when empty', () => {
    const { container, rerender } = render(
      <MemoryRouter>
        <CharacterOrganizationsSummary
          campaignId="camp-1"
          organizationReferences={[
            {
              organizationId: CITY_COUNCIL.id,
              organization: CITY_COUNCIL,
            },
            {
              organizationId: 'org-missing',
              organization: null,
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Organizations:/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'City Council' })).toHaveAttribute(
      'href',
      `/campaigns/camp-1/organizations/${CITY_COUNCIL.id}`,
    )
    expect(screen.getByText(UNAVAILABLE_ORGANIZATION_LABEL, { exact: false })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <CharacterOrganizationsSummary campaignId="camp-1" organizationReferences={[]} />
      </MemoryRouter>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterOrganizationsSummary
          campaignId="camp-1"
          organizationReferences={[
            {
              organizationId: CITY_COUNCIL.id,
              organization: CITY_COUNCIL,
            },
          ]}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
