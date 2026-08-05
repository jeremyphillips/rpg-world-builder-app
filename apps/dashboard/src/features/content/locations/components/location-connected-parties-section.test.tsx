import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import {
  LocationConnectedPartiesSection,
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
} from './location-connected-parties-section.client'

const sampleRows = [
  {
    relationshipId: 'rel-org-1',
    subject: { type: 'organization' as const, id: 'org-1', name: 'City Council', slug: 'council' },
    kind: 'governs',
    label: 'Governs',
    family: 'territorial_authority',
    priority: 50,
    sectionGroup: 'territorial_authority' as const,
  },
]

describe('LocationConnectedPartiesSection', () => {
  it('hides empty people section from read-only viewers', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="people_and_organizations"
          rows={[]}
          showEmptySection={false}
        />
      </MemoryRouter>,
    )

    expect(
      screen.queryByRole('heading', { name: 'People & organizations' }),
    ).not.toBeInTheDocument()
  })

  it('shows manager slot scaffolding when territorial authority is empty', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="territorial_authority"
          rows={[]}
          canManage
          showEmptySection
          organizationAddAffordances={[{ intent: 'territorial_authority', label: 'Add authority' }]}
          onAddOrganization={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Governs' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Controls' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Claims' })).toBeInTheDocument()
    expect(screen.getByText('No governing organization.')).toBeInTheDocument()
  })

  it('shows manager scaffolding and region-specific add actions when people section is empty', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="people_and_organizations"
          rows={[]}
          canManage
          showEmptySection
          organizationAddAffordances={[
            { intent: 'geographic_presence', label: 'Add organization presence' },
          ]}
          onAddOrganization={() => undefined}
          onAddCharacter={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(LOCATION_CONNECTED_PARTIES_EMPTY_TEXT.people_and_organizations),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add organization presence' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Link character' })).toBeInTheDocument()
  })

  it('invokes add organization intent callbacks', async () => {
    const user = userEvent.setup()
    const onAddOrganization = vi.fn()

    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="territorial_authority"
          rows={[]}
          canManage
          showEmptySection
          organizationAddAffordances={[{ intent: 'territorial_authority', label: 'Add authority' }]}
          onAddOrganization={onAddOrganization}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add authority' }))
    expect(onAddOrganization).toHaveBeenCalledWith('territorial_authority')
  })

  it('invokes edit callbacks for connected rows', async () => {
    const user = userEvent.setup()
    const onEditConnection = vi.fn()

    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="territorial_authority"
          rows={sampleRows}
          canManage
          showEmptySection
          onEditConnection={onEditConnection}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for City Council' }))
    await user.click(screen.getByRole('menuitem', { name: 'Change authority type' }))
    expect(onEditConnection).toHaveBeenCalledWith({
      relationshipId: 'rel-org-1',
      subjectType: 'organization',
      subjectId: 'org-1',
      kind: 'governs',
    })
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="territorial_authority"
          rows={sampleRows}
          canManage
          showEmptySection
        />
      </MemoryRouter>,
    )
    await expectNoAxeViolations(container)
  })
})
