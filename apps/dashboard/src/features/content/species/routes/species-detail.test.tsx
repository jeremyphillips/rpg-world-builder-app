import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedLanguageVocabulary,
  buildSeedSenseVocabulary,
} from '@/features/vocabulary'
import { SPECIES_STAT_LABELS } from '@/features/content'

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('../../lib/usage/content-usage-references-section.client', () => ({
  ContentUsageReferencesSection: () => null,
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))
import type * as VocabularyFeature from '@/features/vocabulary'

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const actual = await importOriginal<typeof VocabularyFeature>()
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
} from '@/features/vocabulary'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ELF, HUMAN } from '../fixtures'
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

  it('renders language affinities as a stat row when present', () => {
    renderSpeciesDetail(ELF)

    expect(screen.getByText(SPECIES_STAT_LABELS.languageAffinities)).toBeInTheDocument()
    expect(screen.getByText('Elvish')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Language affinities' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
  })

  it('omits the language affinities stat row when absent', () => {
    renderSpeciesDetail(HUMAN)

    expect(screen.queryByText(SPECIES_STAT_LABELS.languageAffinities)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderSpeciesDetail(ELF)

    await expectNoAxeViolations(container)
  })
})
