import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { CharacterConnectionsSection } from './character-connections-section'
import { useCharacterConnectionsSheet } from '../../../hooks/use-character-connections-sheet'

vi.mock('../../../hooks/use-character-connections-sheet')

const mockedUseCharacterConnectionsSheet = vi.mocked(useCharacterConnectionsSheet)

function mockConnectionsSheet(
  overrides: Partial<ReturnType<typeof useCharacterConnectionsSheet>> = {},
) {
  mockedUseCharacterConnectionsSheet.mockReturnValue({
    isBootstrapping: false,
    isRelationshipsError: false,
    relationshipsErrorLabel: undefined,
    projections: [],
    sheetData: {
      campaignId: 'campaign-1',
      characterId: 'character-1',
      availableOrganizations: [],
      organizationsById: new Map(),
      locationsById: new Map(),
      charactersById: new Map(),
      campaignCharacterOptions: [],
      eligibleResidenceLocations: [],
      eligiblePropertyLocations: [],
      allLocations: [],
      locationsQueryStatus: { status: 'idle' },
    },
    editingRow: null,
    setEditingRow: vi.fn(),
    handleAddPerson: vi.fn(),
    handleAddOrganization: vi.fn(),
    handleAddPlace: vi.fn(),
    handleAddProperty: vi.fn(),
    handleSaveRow: vi.fn(),
    handleRemoveRow: vi.fn(),
    isMutating: false,
    ...overrides,
  })
}

describe('CharacterConnectionsSection', () => {
  it('renders grouped connection rows with pencil edit controls', async () => {
    const user = userEvent.setup()
    const setEditingRow = vi.fn()

    mockConnectionsSheet({
      setEditingRow,
      projections: [
        {
          relationshipId: 'edge-person',
          kind: 'parentOf',
          section: 'people.family',
          roleLabel: 'Parent',
          details: {},
          visibility: 'dm_only',
          participantIds: [],
          referenceStatus: 'resolved',
          revision: 1,
          capabilities: { canUpdateDetails: true, canDelete: true },
          target: {
            type: 'character',
            id: 'npc-1',
            name: 'Darius Vale',
            characterType: 'npc',
          },
        },
        {
          relationshipId: 'edge-place',
          kind: 'hometown',
          section: 'places',
          roleLabel: 'Hometown',
          details: {},
          visibility: 'dm_only',
          participantIds: [],
          referenceStatus: 'resolved',
          revision: 1,
          capabilities: { canUpdateDetails: true, canDelete: true },
          target: {
            type: 'location',
            id: 'loc-1',
            name: 'Waterdeep',
            slug: 'waterdeep',
          },
        },
      ],
    })

    render(
      <MemoryRouter>
        <CharacterConnectionsSection
          campaignId="campaign-1"
          characterId="character-1"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Connections')).toBeInTheDocument()
    expect(screen.getByText('People')).toBeInTheDocument()
    expect(screen.getByText('Places')).toBeInTheDocument()
    expect(screen.getByText('Darius Vale')).toBeInTheDocument()
    expect(screen.getByText('Waterdeep')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit relationship for Darius Vale' }))
    expect(setEditingRow).toHaveBeenCalled()
  })

  it('shows an error alert instead of the empty state when relationships fail to load', () => {
    mockConnectionsSheet({
      isRelationshipsError: true,
      relationshipsErrorLabel: 'Network error',
      projections: [],
    })

    render(
      <MemoryRouter>
        <CharacterConnectionsSection
          campaignId="campaign-1"
          characterId="character-1"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Network error')
    expect(screen.queryByText('No connections added yet.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add connection' })).not.toBeInTheDocument()
  })

  it('opens the add connection menu with four section options', async () => {
    const user = userEvent.setup()
    mockConnectionsSheet()

    render(
      <MemoryRouter>
        <CharacterConnectionsSection
          campaignId="campaign-1"
          characterId="character-1"
          canEdit
          subjectKind="npc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add connection' }))
    expect(screen.getByText('Add person')).toBeInTheDocument()
    expect(screen.getByText('Add organization')).toBeInTheDocument()
    expect(screen.getByText('Add place')).toBeInTheDocument()
    expect(screen.getByText('Add property')).toBeInTheDocument()
  })
})
