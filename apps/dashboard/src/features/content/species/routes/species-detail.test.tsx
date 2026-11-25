import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SPELL_REFERENCE_DISPLAY_MESSAGES } from '@rpg/contracts'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedDamageTypeVocabulary,
  buildSeedLanguageVocabulary,
  buildSeedSenseVocabulary,
} from '@/features/vocabulary'
import { SPECIES_STAT_LABELS } from '@/features/content'

vi.mock('../../equipment/hooks/use-equipment', async (importOriginal) => ({
  ...(await importOriginal()),
  useEquipment: () => ({ data: [], isPending: false, isError: false }),
}))
vi.mock('../../skill-proficiencies/hooks/use-skill-proficiencies', async (importOriginal) => ({
  ...(await importOriginal()),
  useSkillProficiencies: () => ({ data: [], isPending: false, isError: false }),
}))
vi.mock('../../spells/hooks/use-spells', async (importOriginal) => ({
  ...(await importOriginal()),
  useSpells: vi.fn(),
}))

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('../../lib/usage/content-usage-references-section', () => ({
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
    useDamageTypeVocabulary: vi.fn(),
  }
})

import {
  useCreatureTypeVocabulary,
  useLanguageVocabulary,
  useDamageTypeVocabulary,
  useSenseVocabulary,
} from '@/features/vocabulary'
import { getDrowHeritageSpellCatalog } from '../../lib/fixtures/grant-display-fixtures'
import { useSpells } from '../../spells/hooks/use-spells'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ELF, TIEFLING } from '../fixtures'
import { SpeciesDetailContent } from './species-detail'

const useSpellsMock = vi.mocked(useSpells)
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
    useSpellsMock.mockReturnValue({
      data: getDrowHeritageSpellCatalog(),
      isPending: false,
      isError: false,
    } as ReturnType<typeof useSpells>)
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
    vi.mocked(useDamageTypeVocabulary).mockReturnValue({
      vocabulary: buildSeedDamageTypeVocabulary(),
      isPending: false,
      isError: false,
    } as ReturnType<typeof useDamageTypeVocabulary>)
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
    renderSpeciesDetail(TIEFLING)

    expect(screen.queryByText(SPECIES_STAT_LABELS.languageAffinities)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Traits' })).toBeInTheDocument()
  })

  it('renders Drow cantrip and spell names from the campaign catalog', () => {
    renderSpeciesDetail(ELF)

    for (const name of [
      /^L1: .*Dancing Lights cantrip$/,
      /^L3: Faerie Fire spell$/,
      /^L5: Darkness spell$/,
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    expect(useSpellsMock).toHaveBeenCalledWith(STORY_CAMPAIGN_ID)
  })

  it.each([
    [true, false, SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading],
    [false, true, SPELL_REFERENCE_DISPLAY_MESSAGES.catalogError],
    [false, false, SPELL_REFERENCE_DISPLAY_MESSAGES.unknownSpell],
  ])('renders spell catalog guidance with pending=%s and error=%s', (isPending, isError, label) => {
    useSpellsMock.mockReturnValue({
      data: isPending || isError ? undefined : [],
      isPending,
      isError,
    } as ReturnType<typeof useSpells>)

    renderSpeciesDetail(ELF)

    expect(screen.getAllByText(label, { exact: false }).length).toBeGreaterThan(0)
    expect(screen.queryByText(/^L1: .*Dancing Lights cantrip$/)).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderSpeciesDetail(ELF)

    await expectNoAxeViolations(container)
  })
})
