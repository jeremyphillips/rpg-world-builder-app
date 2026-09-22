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
    locations: [residence],
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

  it('keeps an optimistic residence row while server data is still stale', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn().mockResolvedValue(undefined)

    mockResidenceSheet({
      handleAdd,
    })

    render(
      <MemoryRouter>
        <CharacterResidenceContainer
          campaignId="campaign-1"
          characterId="character-1"
          canEdit
          subjectKind="npc"
        />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Add residence' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' }).at(-1)!)

    await waitFor(() => {
      expect(handleAdd).toHaveBeenCalledWith({ locationId: residence.id })
      expect(screen.getByText('Harborford')).toBeInTheDocument()
      expect(screen.queryByText('No residence added.')).not.toBeInTheDocument()
    })
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

  it('shows catalog names on read-only sheets without a locations query', () => {
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
      locations: [],
      pickerItems: [],
    })

    render(
      <MemoryRouter>
        <CharacterResidenceContainer
          campaignId="campaign-1"
          characterId="character-1"
          canEdit={false}
          subjectKind="pc"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Harborford')).toBeInTheDocument()
    expect(screen.queryByText('Unavailable location')).not.toBeInTheDocument()
  })

  it('removes the confirmed residence before adding the replacement', async () => {
    const user = userEvent.setup()
    const millbridge = makeLocation({
      id: 'location-millbridge',
      slug: 'millbridge',
      name: 'Millbridge',
      kind: 'settlement',
      settlementType: 'city',
    })
    const order: string[] = []
    const handleAdd = vi.fn(async () => {
      order.push('add')
    })
    const handleRemove = vi.fn(async () => {
      order.push('remove')
    })

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
      locations: [residence, millbridge],
      pickerItems: [
        { location: residence, selected: true },
        { location: millbridge, selected: false },
      ],
      handleAdd,
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

    await user.click(screen.getByRole('button', { name: 'Add residence' }))
    await user.click(screen.getAllByRole('button', { name: 'Add' }).at(-1)!)

    await waitFor(() => {
      expect(order).toEqual(['remove', 'add'])
    })
    expect(handleRemove).toHaveBeenCalledWith('conn-1', residence.id)
    expect(handleAdd).toHaveBeenCalledWith({ locationId: millbridge.id })
    expect(screen.getByText('Millbridge')).toBeInTheDocument()
    expect(screen.queryByText('Harborford')).not.toBeInTheDocument()
  })
})
