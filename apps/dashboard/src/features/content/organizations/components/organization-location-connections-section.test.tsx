import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { Button } from '@rpg/ui'

import {
  OrganizationLocationConnectionsSection,
  ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR,
} from './organization-location-connections-section.client'
import { ORGANIZATION_EMPTY_SECTION_TEXT } from '../lib/organization-display'

const sampleLocationConnections = {
  previewItems: [
    {
      connectionId: 'conn-1',
      locationId: 'region-1',
      kind: 'governs' as const,
      family: 'territorial_authority' as const,
      familyLabel: 'Territorial authority',
      relationshipLabel: 'Governs',
      card: {
        id: 'region-1',
        name: 'Grey Coast',
        summary: 'Territorial authority · Governs',
      },
      detailHref: '/campaigns/camp-1/locations/region-1',
      locationUnavailable: false,
    },
  ],
  total: 1,
  emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
}

describe('OrganizationLocationConnectionsSection', () => {
  it('renders grouped location connection cards', () => {
    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection locationConnections={sampleLocationConnections} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Location connections' })).toBeInTheDocument()
    expect(screen.getByText('1 location connection')).toBeInTheDocument()
    expect(screen.getByText('Grey Coast')).toBeInTheDocument()
    expect(screen.getByText('Territorial authority')).toBeInTheDocument()
  })

  it('renders empty and error states', () => {
    const { rerender } = render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
          }}
          canManage
          showEmptySection
          addConnectionAction={
            <Button type="button" variant="outline">
              Add connection
            </Button>
          }
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add connection' })).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={{
            previewItems: [],
            total: 0,
            emptyText: ORGANIZATION_EMPTY_SECTION_TEXT.locationConnections,
          }}
          showEmptySection={false}
        />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('heading', { name: 'Location connections' })).not.toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={sampleLocationConnections}
          isError
          errorText={ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(ORGANIZATION_LOCATION_CONNECTIONS_LOAD_ERROR)).toBeInTheDocument()
  })

  it('invokes edit callbacks for managers', async () => {
    const user = userEvent.setup()
    const onEditConnection = vi.fn()

    render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection
          locationConnections={sampleLocationConnections}
          canManage
          showEmptySection
          onEditConnection={onEditConnection}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for Grey Coast' }))
    await user.click(screen.getByRole('menuitem', { name: 'Change connection type' }))
    expect(onEditConnection).toHaveBeenCalledWith({
      connectionId: 'conn-1',
      locationId: 'region-1',
      kind: 'governs',
    })
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <OrganizationLocationConnectionsSection locationConnections={sampleLocationConnections} />
      </MemoryRouter>,
    )
    await expectNoAxeViolations(container)
  })
})
