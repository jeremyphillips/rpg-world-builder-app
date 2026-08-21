import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/test/render'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../lib/fixtures/character-builder-fixtures'
import { buildCharacterDetailViewModel } from '../lib/display/character-display'
import { SAMPLE_PC } from '../lib/fixtures/character-fixtures'
import { CharacterDetail } from './character-detail'

vi.mock('../hooks/use-character')
vi.mock('../hooks/use-build-context')
vi.mock('../components/standalone-character-redirect-guard', () => ({
  StandaloneCharacterRedirectGuard: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('@rpg/catalog/xp-progressions', () => ({
  getStandardXpProgression: () => ({ entries: [{ level: 1, xpRequired: 0 }] }),
}))

import { useCharacter as useCharacterFn } from '../hooks/use-character'
import { useBuildContext as useBuildContextFn } from '../hooks/use-build-context'

const useCharacter = vi.mocked(useCharacterFn)
const useBuildContext = vi.mocked(useBuildContextFn)

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
const viewModel = buildCharacterDetailViewModel({
  character: SAMPLE_PC,
  catalogIndex,
  rules: context.characterCreationRules,
  xpProgression: { entries: [{ level: 1, xpRequired: 0 }] },
})

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
    isSuccess: Boolean(overrides.data),
    ...overrides,
  } as ReturnType<typeof useCharacterFn>)
}

function mockBuildContext(overrides: Partial<ReturnType<typeof useBuildContextFn>> = {}) {
  useBuildContext.mockReturnValue({
    data: { catalog: context.catalog, patch: {} },
    context,
    catalogIndex,
    storageKey: 'test-storage-key',
    isPending: false,
    isError: false,
    error: null,
    isLoading: false,
    isFetching: false,
    ...overrides,
  } as ReturnType<typeof useBuildContextFn>)
}

describe('CharacterDetail', () => {
  beforeEach(() => {
    useCharacter.mockReset()
    useBuildContext.mockReset()
    mockBuildContext()
  })

  it('renders the loaded character', () => {
    mockCharacterQuery({ data: SAMPLE_PC })

    renderWithProviders(
      <Routes>
        <Route path="/characters/:characterId" element={<CharacterDetail />} />
      </Routes>,
      { initialEntries: ['/characters/char-sample-1'] },
    )

    expect(screen.getByRole('heading', { name: viewModel.identity.name })).toBeInTheDocument()
    expect(screen.getByText(viewModel.identity.summary)).toBeInTheDocument()
  })

  it('shows a loading state while pending', () => {
    mockCharacterQuery({ isPending: true, data: undefined, isSuccess: false })

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
      isSuccess: false,
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
