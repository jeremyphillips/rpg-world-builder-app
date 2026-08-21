import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { testRegionLocation } from '@/features/content/lib/fixtures/location-test-helpers'
import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'

import {
  LocationConnectedPartiesSection,
  LOCATION_CONNECTED_PARTIES_EMPTY_TEXT,
} from './location-connected-parties-section.client'
import { LOCATION_PEOPLE_SECTION_SURFACE_COPY } from '../../lib/connected-parties/location-connected-parties-section-copy'

import type { LocationConnectedPartyRow } from '@rpg/contracts'

const sampleLocation = testRegionLocation({
  name: 'Lankhmar',
  slug: 'lankhmar',
})

const sampleRows: LocationConnectedPartyRow[] = [
  {
    relationshipId: 'rel-org-1',
    subjectType: 'organization',
    subject: { type: 'organization', id: 'org-1', name: 'City Council', slug: 'council' },
    kind: 'governs',
    label: 'Governed by',
    family: 'territorial_authority',
    priority: 50,
    sectionGroup: 'territorial_authority',
  },
]

const claimRows: LocationConnectedPartyRow[] = [
  {
    relationshipId: 'rel-org-claim',
    subjectType: 'organization',
    subject: {
      type: 'organization',
      id: 'org-guild',
      name: "Thieves' Guild",
      slug: 'thieves-guild',
    },
    kind: 'claims',
    label: 'Claimed by',
    family: 'territorial_authority',
    priority: 40,
    sectionGroup: 'territorial_authority',
  },
]

const peopleOrganizationRows: LocationConnectedPartyRow[] = [
  {
    relationshipId: 'rel-org-hq',
    subjectType: 'organization',
    subject: {
      type: 'organization',
      id: 'org-guild',
      name: "Thieves' Guild",
      slug: 'thieves-guild',
    },
    kind: 'headquarters',
    label: 'Headquarters of',
    family: 'site',
    priority: 60,
    sectionGroup: 'people_and_organizations',
  },
]

const peopleNpcRows: LocationConnectedPartyRow[] = [
  {
    relationshipId: 'rel-npc-1',
    subjectType: 'character',
    subject: {
      type: 'character',
      id: 'npc-1',
      name: 'Durnan',
      slug: 'npc-1',
      characterType: 'npc',
    },
    kind: 'works_at',
    label: 'Works here',
    family: 'operation',
    priority: 40,
    sectionGroup: 'people_and_organizations',
  },
]

const peopleKindSlots = [
  {
    heading: 'Headquarters of',
    bindings: [{ subjectType: 'organization' as const, kind: 'headquarters' as const }],
  },
  {
    heading: 'Operating here',
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
          location={sampleLocation}
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
          location={sampleLocation}
          sectionGroup="territorial_authority"
          rows={[]}
          canManage
          showEmptySection
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Territorial Authority' })).toBeInTheDocument()
    expect(screen.getByText('Governed by')).toBeInTheDocument()
    expect(screen.getByText('Controlled by')).toBeInTheDocument()
    expect(screen.getByText('Claimed by')).toBeInTheDocument()
    expect(screen.getByText('No governing organization.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add authority' })).not.toBeInTheDocument()
  })

  it('mounts territorial add actions in the labeled group header, not the empty row', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
          sectionGroup="territorial_authority"
          rows={[]}
          canManage
          showEmptySection
        />
      </MemoryRouter>,
    )

    const slots = [
      {
        eyebrow: 'Governed by',
        add: 'Add governing organization',
        empty: 'No governing organization.',
      },
      { eyebrow: 'Controlled by', add: 'Add organization', empty: 'No controlling organization.' },
      { eyebrow: 'Claimed by', add: 'Add claim', empty: 'No organizations claim this location.' },
    ]

    for (const slot of slots) {
      const addButton = screen.getByRole('button', { name: slot.add })
      expect(
        screen.getByText(slot.eyebrow).closest('[data-slot="relationship-list-group-header"]'),
      ).toContainElement(addButton)
      expect(
        screen.getByText(slot.empty).closest('[data-slot="relationship-list-group-header"]'),
      ).toBeNull()
    }
  })

  it('keeps the claims add action in the group header when populated and hides singleton adds at capacity', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
          sectionGroup="territorial_authority"
          rows={[...sampleRows, ...claimRows]}
          canManage
          showEmptySection
        />
      </MemoryRouter>,
    )

    const addClaim = screen.getByRole('button', { name: 'Add claim' })
    expect(
      screen.getByText('Claimed by').closest('[data-slot="relationship-list-group-header"]'),
    ).toContainElement(addClaim)
    expect(screen.getByText("Thieves' Guild")).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Add governing organization' }),
    ).not.toBeInTheDocument()
  })

  it('renders a family empty state without per-kind empty groups', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
          sectionGroup="people_and_organizations"
          rows={[]}
          canManage
          showEmptySection
          peopleKindSlots={peopleKindSlots}
          canAddToPeopleSection
          onAddPeopleSection={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText(LOCATION_CONNECTED_PARTIES_EMPTY_TEXT.people_and_organizations),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'People & organizations' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: LOCATION_PEOPLE_SECTION_SURFACE_COPY.add }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Operating here')).not.toBeInTheDocument()
    expect(screen.queryByText('Works here')).not.toBeInTheDocument()
    expect(screen.queryByText('No owners linked.')).not.toBeInTheDocument()
  })

  it('renders only populated kind groups with a quiet family add action', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
          sectionGroup="people_and_organizations"
          rows={peopleOrganizationRows}
          canManage
          showEmptySection
          peopleKindSlots={peopleKindSlots}
          canAddToPeopleSection
          onAddPeopleSection={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText("Thieves' Guild")).toBeInTheDocument()
    expect(screen.getByText('Headquarters of')).toBeInTheDocument()
    expect(screen.queryByText('Operating here')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: LOCATION_PEOPLE_SECTION_SURFACE_COPY.add }),
    ).toBeInTheDocument()
  })

  it('invokes per-kind territorial add callbacks from slot actions', async () => {
    const user = userEvent.setup()
    const onAddTerritorialKind = vi.fn()

    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
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
          location={sampleLocation}
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
          location={sampleLocation}
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

  it('links NPC people rows to the npc detail route', () => {
    render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
          sectionGroup="people_and_organizations"
          rows={peopleNpcRows}
          canManage
          showEmptySection
          peopleKindSlots={peopleKindSlots}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Durnan' })).toHaveAttribute(
      'href',
      `/campaigns/${STORY_CAMPAIGN_ID}/npcs/npc-1`,
    )
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <LocationConnectedPartiesSection
          campaignId={STORY_CAMPAIGN_ID}
          location={sampleLocation}
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
