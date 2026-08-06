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

const peopleKindSlots = [
  {
    heading: 'Operates in',
    bindings: [{ subjectType: 'organization' as const, kind: 'operates_in' as const }],
  },
  {
    heading: 'Works here',
    bindings: [{ subjectType: 'character' as const, kind: 'works_at' as const }],
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
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Territorial Authority' })).toBeInTheDocument()
    expect(screen.getByText('Governs')).toBeInTheDocument()
    expect(screen.getByText('Controls')).toBeInTheDocument()
    expect(screen.getByText('Claims')).toBeInTheDocument()
    expect(screen.getByText('No governing organization.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add authority' })).not.toBeInTheDocument()
  })

  it('shows per-kind people section scaffolding when empty', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="people_and_organizations"
          rows={[]}
          canManage
          showEmptySection
          peopleKindSlots={peopleKindSlots}
          onAddPeopleKindSlot={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(LOCATION_CONNECTED_PARTIES_EMPTY_TEXT.people_and_organizations),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'People & organizations' })).toBeInTheDocument()
    expect(screen.getByText('Operates in')).toBeInTheDocument()
    expect(screen.getByText('Works here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add organization presence' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add worker' })).toBeInTheDocument()
  })

  it('invokes per-kind territorial add callbacks from slot actions', async () => {
    const user = userEvent.setup()
    const onAddTerritorialKind = vi.fn()

    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="territorial_authority"
          rows={[]}
          canManage
          showEmptySection
          onAddTerritorialKind={onAddTerritorialKind}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    expect(onAddTerritorialKind).toHaveBeenCalledWith('controls')
  })

  it('renders populated territorial rows without generic entity-type metadata', () => {
    render(
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

    expect(screen.getByText('City Council')).toBeInTheDocument()
    expect(screen.queryByText('Organization')).not.toBeInTheDocument()
  })

  it('invokes change-kind callbacks for territorial rows', async () => {
    const user = userEvent.setup()
    const onChangeTerritorialKind = vi.fn()

    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          sectionGroup="territorial_authority"
          rows={sampleRows}
          canManage
          showEmptySection
          onChangeTerritorialKind={onChangeTerritorialKind}
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Actions for City Council' }))
    await user.click(screen.getByRole('menuitem', { name: 'Change authority type' }))
    expect(onChangeTerritorialKind).toHaveBeenCalledWith({
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
