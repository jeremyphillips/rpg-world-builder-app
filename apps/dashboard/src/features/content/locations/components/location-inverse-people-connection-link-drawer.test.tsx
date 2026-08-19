import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { YAWNING_PORTAL, LOCATIONS_LIST } from '../fixtures'
import { buildLocationsById } from '../lib/location-display'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CITY_COUNCIL } from '../../organizations/fixtures'
import { PEOPLE_SECTION_KIND_FULLY_LINKED_REASON } from '../../lib/location-connection-kind-options'
import { LOCATION_PEOPLE_SECTION_SURFACE_COPY } from '../lib/location-connected-parties-section-copy'
import { LocationInversePeopleConnectionLinkDrawer } from './location-inverse-people-connection-link-drawer.client'

const ownerSlot = {
  heading: 'Owner',
  bindings: [
    { subjectType: 'organization' as const, kind: 'owns' as const },
    { subjectType: 'character' as const, kind: 'owns' as const },
  ],
}

const headquartersSlot = {
  heading: 'Headquarters',
  bindings: [{ subjectType: 'organization' as const, kind: 'headquarters' as const }],
}

const residentSlot = {
  heading: 'Resident',
  bindings: [{ subjectType: 'character' as const, kind: 'resides_at' as const }],
}

const kindSlots = [ownerSlot, headquartersSlot, residentSlot]
const location = YAWNING_PORTAL

const inverseDrawerContextProps = {
  locationsById: buildLocationsById(LOCATIONS_LIST),
  campaignId: STORY_CAMPAIGN_ID,
}

const sampleOrganizations = [CITY_COUNCIL]

const sampleCharacters = [
  {
    id: 'char-1',
    name: 'Braggi',
    summary: 'Merchant',
    characterType: 'npc' as const,
    classIds: [],
  },
]

describe('LocationInversePeopleConnectionLinkDrawer', () => {
  it('starts with a relationship kind step before entity selection', () => {
    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    expect(
      screen.getByText(LOCATION_PEOPLE_SECTION_SURFACE_COPY.chooseKindMessage),
    ).toBeInTheDocument()
    expect(
      screen.getByText(LOCATION_PEOPLE_SECTION_SURFACE_COPY.kindFieldLabel),
    ).toBeInTheDocument()
    expect(screen.getByText('Owner')).toBeInTheDocument()
    expect(screen.getByText('Headquarters')).toBeInTheDocument()
    expect(screen.getByText('Resident')).toBeInTheDocument()
  })

  it('shows subject type segments only after selecting an ambiguous kind', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    expect(screen.getByText('Owner type')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Character' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Organization' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search characters…')).toBeInTheDocument()
  })

  it('auto-resolves a single subject type after kind selection', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))
    expect(screen.queryByText('Headquarters type')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search organizations…')).toBeInTheDocument()
  })

  it('offers Change and reopens radios when two kind options exist but only one is enabled', async () => {
    const user = userEvent.setup()
    const headquartersLinkedRow = {
      relationshipId: 'conn-hq',
      subjectType: 'organization' as const,
      subject: {
        type: 'organization' as const,
        id: CITY_COUNCIL.id,
        name: CITY_COUNCIL.name,
        slug: CITY_COUNCIL.slug,
      },
      kind: 'headquarters' as const,
      label: 'Headquarters',
      family: 'site' as const,
      priority: 60,
      sectionGroup: 'people_and_organizations' as const,
    }

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={[ownerSlot, headquartersSlot]}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[headquartersLinkedRow]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    expect(screen.queryByRole('radiogroup', { name: /Relationship type/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByRole('radiogroup', { name: /Relationship type/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Headquarters/i })).toBeDisabled()
    expect(screen.getByText(PEOPLE_SECTION_KIND_FULLY_LINKED_REASON)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Owner/i })).toBeEnabled()
  })

  it('shows locked kind and picker without Change when only one kind slot exists', () => {
    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={[headquartersSlot]}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Headquarters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search organizations…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change' })).not.toBeInTheDocument()
    expect(
      screen.queryByText(LOCATION_PEOPLE_SECTION_SURFACE_COPY.chooseKindMessage),
    ).not.toBeInTheDocument()
  })

  it('switches picker copy when the subject type segment changes', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={[ownerSlot]}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search characters…')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Organization' }))
    expect(screen.getByPlaceholderText('Search organizations…')).toBeInTheDocument()
  })

  it('hides subject type, picker, and footer while editing kind upstream', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: 'Organization' }))
    await user.click(screen.getByRole('button', { name: 'Select' }))

    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.getByRole('radiogroup', { name: /Relationship type/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Organization' })).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search organizations…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add owner/i })).not.toBeInTheDocument()
    expect(
      screen.queryByText(LOCATION_PEOPLE_SECTION_SURFACE_COPY.chooseKindMessage),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Choose an organization that owns this location.'),
    ).not.toBeInTheDocument()
  })

  it('retains organization selection through kind edit overlay and same-value dismiss', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: 'Organization' }))
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('preserves organization selection when changing to another compatible kind', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: 'Organization' }))
    await user.click(screen.getByRole('button', { name: 'Select' }))

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: /Headquarters/i }))

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('clears organization selection when changing to an incompatible kind', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: /Owner/i }))
    await user.click(screen.getByRole('button', { name: 'Organization' }))
    await user.click(screen.getByRole('button', { name: 'Select' }))

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('radio', { name: /Resident/i }))

    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        kindSlots={kindSlots}
        location={location}
        {...inverseDrawerContextProps}
        organizations={sampleOrganizations}
        characters={sampleCharacters}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
