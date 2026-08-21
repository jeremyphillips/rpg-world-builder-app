import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { CITY_COUNCIL } from '@/features/content'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../../../lib/display/character-display'
import { CharacterOrganizationsSummary } from './character-organizations-summary'

describe('CharacterOrganizationsSummary', () => {
  it('renders stacked memberships with titles and empty None', () => {
    render(
      <MemoryRouter>
        <CharacterOrganizationsSummary
          campaignId="camp-1"
          memberships={[
            {
              organizationId: CITY_COUNCIL.id,
              title: 'Councillor',
              organization: CITY_COUNCIL,
            },
            {
              organizationId: 'org-untitled',
              organization: { ...CITY_COUNCIL, id: 'org-untitled', name: 'Watch' },
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Organizations')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'City Council' })).toHaveAttribute(
      'href',
      `/campaigns/camp-1/organizations/${CITY_COUNCIL.id}`,
    )
    expect(screen.getByText(/· Councillor/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Watch' })).toBeInTheDocument()
    expect(screen.queryByText(/government/i)).not.toBeInTheDocument()
  })

  it('shows None without edit controls when read-only and empty', () => {
    render(
      <MemoryRouter>
        <CharacterOrganizationsSummary campaignId="camp-1" memberships={[]} />
      </MemoryRouter>,
    )

    expect(screen.getByText('None')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add organization/ })).not.toBeInTheDocument()
  })

  it('shows edit and add controls only when canEdit', async () => {
    const user = userEvent.setup()
    const onEditMembership = vi.fn()
    const onAddOrganization = vi.fn()

    render(
      <MemoryRouter>
        <CharacterOrganizationsSummary
          campaignId="camp-1"
          canEdit
          memberships={[
            {
              organizationId: CITY_COUNCIL.id,
              organization: CITY_COUNCIL,
            },
          ]}
          onEditMembership={onEditMembership}
          onAddOrganization={onAddOrganization}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Edit membership in City Council' }))
    expect(onEditMembership).toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: '+ Add organization' }))
    expect(onAddOrganization).toHaveBeenCalled()
  })

  it('offers remove but not edit for unresolved memberships when editable', async () => {
    const user = userEvent.setup()
    const onRemoveUnresolvedMembership = vi.fn()

    render(
      <MemoryRouter>
        <CharacterOrganizationsSummary
          campaignId="camp-1"
          canEdit
          memberships={[
            {
              organizationId: 'org-missing',
              organization: null,
            },
          ]}
          onRemoveUnresolvedMembership={onRemoveUnresolvedMembership}
          onEditMembership={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(UNAVAILABLE_ORGANIZATION_LABEL)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Edit membership/ })).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', {
        name: `Remove membership in ${UNAVAILABLE_ORGANIZATION_LABEL}`,
      }),
    )
    expect(onRemoveUnresolvedMembership).toHaveBeenCalled()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <CharacterOrganizationsSummary
          campaignId="camp-1"
          canEdit
          memberships={[
            {
              organizationId: CITY_COUNCIL.id,
              title: 'Councillor',
              organization: CITY_COUNCIL,
            },
          ]}
          onEditMembership={vi.fn()}
          onAddOrganization={vi.fn()}
        />
      </MemoryRouter>,
    )

    await expectNoAxeViolations(container)
  })
})
