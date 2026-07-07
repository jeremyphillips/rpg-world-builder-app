import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedLanguageVocabulary,
  buildSeedSenseVocabulary,
} from '@/features/homebrew'

vi.mock('@/components/layout/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))
vi.mock('@/features/homebrew', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/homebrew')>()
  return {
    ...actual,
    useCreatureTypeVocabulary: vi.fn(),
    useSenseVocabulary: vi.fn(),
    useLanguageVocabulary: vi.fn(),
  }
})

import {
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
  useSenseVocabulary,
} from '@/features/homebrew'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ELF, ORC } from '../fixtures'
import { SpeciesDetailContent } from './species-detail'

const useCreatureTypeVocabularyMock = vi.mocked(useCreatureTypeVocabulary)
const useSenseVocabularyMock = vi.mocked(useSenseVocabulary)
const useLanguageVocabularyMock = vi.mocked(useLanguageVocabulary)

function renderSpeciesDetail(species: typeof ELF) {
  return render(
    <MemoryRouter>
      <SpeciesDetailContent species={species} campaignId={STORY_CAMPAIGN_ID} />
    </MemoryRouter>,
  )
}

describe('SpeciesDetailContent language affinities', () => {
  beforeEach(() => {
    useCreatureTypeVocabularyMock.mockReturnValue({
      vocabulary: buildSeedCreatureTypeVocabulary(),
      isPending: false,
      isError: false,
    } as ReturnType<typeof useCreatureTypeVocabulary>)
    useSenseVocabularyMock.mockReturnValue({
      vocabulary: buildSeedSenseVocabulary(),
      isPending: false,
      isError: false,
    } as ReturnType<typeof useSenseVocabulary>)
    useLanguageVocabularyMock.mockReturnValue({
      vocabulary: buildSeedLanguageVocabulary(),
      isPending: false,
      isError: false,
    } as ReturnType<typeof useLanguageVocabulary>)
  })

  it('renders language affinities above traits when present', () => {
    renderSpeciesDetail(ELF)

    expect(screen.getByRole('heading', { name: 'Language affinities' })).toBeInTheDocument()
    expect(screen.getByText('Elvish')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
  })

  it('omits the language affinities section when absent', () => {
    renderSpeciesDetail(ORC)

    expect(screen.queryByRole('heading', { name: 'Language affinities' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderSpeciesDetail(ELF)

    await expectNoAxeViolations(container)
  })
})
