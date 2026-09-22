import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CharacterOrganizationMembershipsContainer } from './character-organization-memberships-container'
import { useCharacterOrganizationMembershipsSheet } from '../../../hooks/use-character-organization-memberships-sheet'
import { lanternGuild } from '../../connections/picker/organization-picker-drawer.fixtures'
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
})
