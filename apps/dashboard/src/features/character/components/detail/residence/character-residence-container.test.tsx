import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import { CharacterResidenceContainer } from './character-residence-container'
import { useCharacterResidenceSheet } from '../../../hooks/use-character-residence-sheet'
import { RESIDENCE_CONNECTION_KIND } from '../../../lib/connections/residence-location-connection.lib'

vi.mock('../../../hooks/use-character-residence-sheet')

const residence = makeLocation({
  id: 'location-harborford',
  slug: 'harborford',
  name: 'Harborford',
  kind: 'settlement',
  settlementType: 'city',
})

const mockedUseCharacterResidenceSheet = vi.mocked(useCharacterResidenceSheet)

function mockResidenceSheet(
  overrides: Partial<ReturnType<typeof useCharacterResidenceSheet>> = {},
) {
  mockedUseCharacterResidenceSheet.mockReturnValue({
    isBootstrapping: false,
    locationReferences: [],
    pickerItems: [{ location: residence, selected: false }],
    locationsQueryStatus: { status: 'success' },
    handleAdd: vi.fn(),
    handleRemove: vi.fn(),
    ...overrides,
  })
}

describe('CharacterResidenceContainer', () => {
  it('renders an empty residence state and opens the add picker', async () => {
    const user = userEvent.setup()
    mockResidenceSheet()

    render(
      <MemoryRouter>
        <CharacterResidenceContainer
          campaignId="campaign-1"
          characterId="character-1"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('No residence added.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add residence' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows remove failures without hiding the row', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn().mockRejectedValue(new Error('Could not remove this residence.'))

    mockResidenceSheet({
      locationReferences: [
        {
          connection: {
            id: 'conn-1',
            locationId: residence.id,
            kind: RESIDENCE_CONNECTION_KIND,
          },
          location: residence,
        },
      ],
      handleRemove,
    })

    render(
      <MemoryRouter>
        <CharacterResidenceContainer
          campaignId="campaign-1"
          characterId="character-1"
          canEdit
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /Remove .*Harborford/ }))

    await waitFor(() => {
      expect(screen.getByText('Could not remove this residence.')).toBeInTheDocument()
      expect(screen.queryByText('No residence added.')).not.toBeInTheDocument()
    })
    expect(handleRemove).toHaveBeenCalledWith('conn-1', residence.id)
  })
})
