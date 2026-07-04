import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/test/render'

import { SAMPLE_PC } from '../lib/character-fixtures'
import { CharacterDetail } from './character-detail'

vi.mock('../hooks/use-character')

import { useCharacter as useCharacterFn } from '../hooks/use-character'

const useCharacter = vi.mocked(useCharacterFn)

function mockCharacterQuery(
  overrides: Partial<ReturnType<typeof useCharacterFn>> & { data?: typeof SAMPLE_PC },
) {
  useCharacter.mockReturnValue({
    data: overrides.data,
    isPending: false,
    isError: false,
    error: null,
    isLoading: false,
    isFetching: false,
    ...overrides,
  } as ReturnType<typeof useCharacterFn>)
}

describe('CharacterDetail', () => {
  beforeEach(() => {
    useCharacter.mockReset()
  })

  it('renders the loaded character', () => {
    mockCharacterQuery({ data: SAMPLE_PC })

    renderWithProviders(
      <Routes>
        <Route path="/characters/:characterId" element={<CharacterDetail />} />
      </Routes>,
      { initialEntries: ['/characters/char-sample-1'] },
    )

    expect(screen.getByRole('heading', { name: 'Verna' })).toBeInTheDocument()
  })

  it('shows a loading state while pending', () => {
    mockCharacterQuery({ isPending: true, data: undefined })

    renderWithProviders(
      <Routes>
        <Route path="/characters/:characterId" element={<CharacterDetail />} />
      </Routes>,
      { initialEntries: ['/characters/char-sample-1'] },
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows an error alert when the query fails', () => {
    mockCharacterQuery({
      isError: true,
      error: new Error('Character not found.'),
      data: undefined,
    })

    renderWithProviders(
      <Routes>
        <Route path="/characters/:characterId" element={<CharacterDetail />} />
      </Routes>,
      { initialEntries: ['/characters/missing'] },
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Character not found.')
  })
})
