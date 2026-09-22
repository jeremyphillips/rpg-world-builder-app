import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CharacterOrganizationMembershipsContainer } from './character-organization-memberships-container'
import { useCharacterOrganizationMembershipsSheet } from '../../../hooks/use-character-organization-memberships-sheet'
import {
  cityCouncil,
  lanternGuild,
} from '../../connections/picker/organization-picker-drawer.fixtures'
import { useOrganizations } from '@/features/content'

vi.mock('../../../hooks/use-character-organization-memberships-sheet')
vi.mock('@/features/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/content')>()
  return {
    ...actual,
    useOrganizations: vi.fn(),
  }
})

const mockedUseCharacterOrganizationMembershipsSheet = vi.mocked(
  useCharacterOrganizationMembershipsSheet,
)
const mockedUseOrganizations = vi.mocked(useOrganizations)

function mockMembershipSheet(
  overrides: Partial<ReturnType<typeof useCharacterOrganizationMembershipsSheet>> = {},
) {
  mockedUseCharacterOrganizationMembershipsSheet.mockReturnValue({
    isBootstrapping: false,
    memberships: [],
    membershipProjections: [],
    pickerItems: [{ organization: lanternGuild, selected: false }],
    editingMembership: null,
    setEditingMembership: vi.fn(),
    editingOrganization: null,
    unresolvedToRemove: null,
    setUnresolvedToRemove: vi.fn(),
    unresolvedRemoveHeadline: '',
    handleAdd: vi.fn(),
    handleSave: vi.fn(),
    handleRemove: vi.fn(),
    handleRemoveUnresolved: vi.fn(),
    ...overrides,
  })
}

describe('CharacterOrganizationMembershipsContainer', () => {
  it('renders an empty membership state and opens the add picker', async () => {
    const user = userEvent.setup()
    mockMembershipSheet()
    mockedUseOrganizations.mockReturnValue({
      data: [lanternGuild],
    } as unknown as ReturnType<typeof useOrganizations>)

    render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('No organization added.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows catalog organization names optimistically before server refetch', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn().mockResolvedValue(undefined)

    mockMembershipSheet({
      memberships: [],
      membershipProjections: [],
      handleAdd,
    })
    mockedUseOrganizations.mockReturnValue({
      data: [lanternGuild],
    } as unknown as ReturnType<typeof useOrganizations>)

    render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit
          subjectKind="npc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Add organization' }))

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledWith(lanternGuild.id, expect.any(String))
      expect(screen.getByText('Lantern Guild')).toBeInTheDocument()
      expect(screen.queryByText('organization 1')).not.toBeInTheDocument()
    })
  })

  it('disables add when canEdit is false', () => {
    mockMembershipSheet()
    mockedUseOrganizations.mockReturnValue({
      data: [lanternGuild],
    } as unknown as ReturnType<typeof useOrganizations>)

    render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit={false}
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Add organization' })).toBeDisabled()
  })

  it('shows catalog names on read-only sheets without a catalog query', () => {
    mockMembershipSheet({
      memberships: [
        {
          relationshipId: 'edge-1',
          revision: 1,
          organizationId: lanternGuild.id,
          organization: lanternGuild,
        },
      ],
      membershipProjections: [
        {
          relationshipId: 'edge-1',
          kind: 'organizationMembership',
          section: 'organizations',
          roleLabel: 'Member',
          details: {},
          visibility: 'dm_only',
          referenceStatus: 'resolved',
          target: {
            type: 'organization',
            id: lanternGuild.id,
            name: lanternGuild.name,
            slug: lanternGuild.slug,
          },
          revision: 1,
          capabilities: { canUpdateDetails: true, canDelete: true },
        },
      ],
    })
    mockedUseOrganizations.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useOrganizations>)

    render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit={false}
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Lantern Guild')).toBeInTheDocument()
    expect(screen.queryByText('Unavailable organization')).not.toBeInTheDocument()
  })

  it('opens the membership editor with the server-resolved organization', async () => {
    const user = userEvent.setup()
    const membership = {
      relationshipId: 'edge-1',
      revision: 1,
      organizationId: lanternGuild.id,
      title: 'Member',
      organization: lanternGuild,
    }
    const setEditingMembership = vi.fn()

    mockMembershipSheet({
      memberships: [membership],
      membershipProjections: [
        {
          relationshipId: 'edge-1',
          kind: 'organizationMembership',
          section: 'organizations',
          roleLabel: 'Member',
          details: { title: 'Member' },
          visibility: 'dm_only',
          referenceStatus: 'resolved',
          target: {
            type: 'organization',
            id: lanternGuild.id,
            name: lanternGuild.name,
            slug: lanternGuild.slug,
          },
          revision: 1,
          capabilities: { canUpdateDetails: true, canDelete: true },
        },
      ],
      setEditingMembership,
    })
    mockedUseOrganizations.mockReturnValue({
      data: [lanternGuild],
    } as unknown as ReturnType<typeof useOrganizations>)

    const { rerender } = render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Edit membership in Lantern Guild' }))
    expect(setEditingMembership).toHaveBeenCalledWith(membership)

    mockMembershipSheet({
      memberships: [membership],
      membershipProjections: [
        {
          relationshipId: 'edge-1',
          kind: 'organizationMembership',
          section: 'organizations',
          roleLabel: 'Member',
          details: { title: 'Member' },
          visibility: 'dm_only',
          referenceStatus: 'resolved',
          target: {
            type: 'organization',
            id: lanternGuild.id,
            name: lanternGuild.name,
            slug: lanternGuild.slug,
          },
          revision: 1,
          capabilities: { canUpdateDetails: true, canDelete: true },
        },
      ],
      setEditingMembership,
      editingMembership: membership,
      editingOrganization: {
        id: lanternGuild.id,
        name: lanternGuild.name,
        organizationDomain: lanternGuild.organizationDomain,
        members: { titles: lanternGuild.members?.titles ?? [] },
      },
    })
    rerender(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Edit organization membership' }),
    ).toBeInTheDocument()
  })

  it('offers unresolved membership removal from the trailing control', async () => {
    const user = userEvent.setup()
    const membership = {
      relationshipId: 'edge-missing',
      revision: 1,
      organizationId: 'organization-missing',
      organization: null,
    }
    const setUnresolvedToRemove = vi.fn()

    mockMembershipSheet({
      memberships: [membership],
      membershipProjections: [
        {
          relationshipId: 'edge-missing',
          kind: 'organizationMembership',
          section: 'organizations',
          roleLabel: 'Member',
          details: {},
          visibility: 'dm_only',
          referenceStatus: 'unavailable',
          revision: 1,
          capabilities: { canUpdateDetails: false, canDelete: true },
        },
      ],
      setUnresolvedToRemove,
    })
    mockedUseOrganizations.mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof useOrganizations>)

    render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Remove Unavailable organization' }))
    expect(setUnresolvedToRemove).toHaveBeenCalledWith(membership)
  })

  it('commits a second membership after an in-flight add finishes', async () => {
    const user = userEvent.setup()
    let releaseFirstAdd: (() => void) | undefined
    const handleAdd = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            releaseFirstAdd = resolve
          }),
      )
      .mockResolvedValue(undefined)

    mockMembershipSheet({
      memberships: [],
      membershipProjections: [],
      handleAdd,
    })
    mockedUseOrganizations.mockReturnValue({
      data: [lanternGuild, cityCouncil],
    } as unknown as ReturnType<typeof useOrganizations>)

    render(
      <MemoryRouter>
        <CharacterOrganizationMembershipsContainer
          campaignId="campaign-1"
          characterId="character-1"
          characterName="Aldric"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Add organization' }))

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole('button', { name: 'Add organization' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]!)
    await user.click(screen.getByRole('button', { name: 'Add organization' }))

    expect(handleAdd).toHaveBeenCalledTimes(1)
    releaseFirstAdd?.()

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledTimes(2)
    })
    expect(handleAdd).toHaveBeenCalledWith(lanternGuild.id, expect.any(String))
    expect(handleAdd).toHaveBeenCalledWith(cityCouncil.id, expect.any(String))
  })
})
