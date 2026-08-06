import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { YAWNING_PORTAL } from '../fixtures'
import { LocationInversePeopleConnectionLinkDrawer } from './location-inverse-people-connection-link-drawer.client'

const ownerSlot = {
  heading: 'Owner',
  bindings: [
    { subjectType: 'organization' as const, kind: 'owns' as const },
    { subjectType: 'character' as const, kind: 'owns' as const },
  ],
}

const location = YAWNING_PORTAL

describe('LocationInversePeopleConnectionLinkDrawer', () => {
  it('shows subject type segments when the slot supports organization and character adds', () => {
    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        slot={ownerSlot}
        location={location}
        organizations={[]}
        characters={[]}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Yawning Portal · Structure')).toBeInTheDocument()
    expect(screen.getByText('Owner type')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Character' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Organization' })).toBeInTheDocument()
  })

  it('switches picker copy when the subject type segment changes', async () => {
    const user = userEvent.setup()

    render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        slot={ownerSlot}
        location={location}
        organizations={[]}
        characters={[]}
        connectedPartyRows={[]}
        canAddOrganization
        canAddCharacter
        onOrganizationSubmit={vi.fn()}
        onCharacterSubmit={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Search characters')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Organization' }))
    expect(screen.getByPlaceholderText('Search organizations')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <LocationInversePeopleConnectionLinkDrawer
        open
        onOpenChange={() => undefined}
        slot={ownerSlot}
        location={location}
        organizations={[]}
        characters={[]}
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
