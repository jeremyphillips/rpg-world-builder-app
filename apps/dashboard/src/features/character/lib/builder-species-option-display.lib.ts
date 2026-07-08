import { type CharacterBuildLanguageOption, type Species, type Spell } from '@rpg/contracts'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedSenseVocabulary,
  getCreatureTypeLabel,
  getSenseLabelFromVocabulary,
} from '@/features/homebrew'
import {
  buildSpeciesCardViewModel,
  buildSpeciesDetailViewModel,
  buildSpellGrantVocabulary,
  SPECIES_SECTION_LABELS,
  type SpeciesDetailItem,
} from '@/features/content'

import type { BuilderOptionDetailsSection } from '@rpg/ui'

const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()
const senseVocabulary = buildSeedSenseVocabulary()

export const BUILDER_SPECIES_EYEBROW = 'Species'

function resolveLanguageLabel(
  languages: readonly CharacterBuildLanguageOption[],
  languageId: string,
): string {
  return languages.find((entry) => entry.id === languageId)?.label ?? languageId
}

function buildBuilderSpeciesVocabulary(
  languages: readonly CharacterBuildLanguageOption[],
  spells: readonly Spell[],
) {
  const resolveSpell = buildSpellGrantVocabulary(spells)

  return {
    resolveCreatureTypeLabel: (id: string) => getCreatureTypeLabel(creatureTypeVocabulary, id),
    resolveLanguageLabel: (id: string) => resolveLanguageLabel(languages, id),
    resolveSenseLabel: (type: string) => getSenseLabelFromVocabulary(senseVocabulary, type),
    resolveSpell,
  }
}

function mapSpeciesDetailItemToSheetItem(item: SpeciesDetailItem) {
  if (item.summaryLines?.length) {
    return {
      title: item.title,
      summaryLines: item.summaryLines,
    }
  }

  return {
    title: item.title,
    body: item.bodyHtml,
  }
}

export function formatSpeciesCardOption(species: Species) {
  return buildSpeciesCardViewModel(species, {
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(creatureTypeVocabulary, id),
  })
}

export type SpeciesDetailsSheetContent = {
  title: string
  eyebrow: string
  descriptionHtml?: string
  metadata: Array<{ label: string; value: string }>
  sections: BuilderOptionDetailsSection[]
}

export function buildSpeciesDetailsSheetContent(
  species: Species,
  languages: readonly CharacterBuildLanguageOption[],
  spells: readonly Spell[] = [],
): SpeciesDetailsSheetContent {
  const viewModel = buildSpeciesDetailViewModel(
    species,
    buildBuilderSpeciesVocabulary(languages, spells),
  )

  const sections: BuilderOptionDetailsSection[] = viewModel.sections.map((section) => {
    if (section.id === 'traits') {
      return {
        title: SPECIES_SECTION_LABELS.traits,
        items: section.items.map(mapSpeciesDetailItemToSheetItem),
      }
    }

    return {
      title: section.title,
      description: section.descriptionHtml,
      items: section.items.map(mapSpeciesDetailItemToSheetItem),
    }
  })

  return {
    title: species.name,
    eyebrow: BUILDER_SPECIES_EYEBROW,
    descriptionHtml: viewModel.descriptionHtml,
    metadata: viewModel.statRows.map(({ label, value }) => ({ label, value })),
    sections,
  }
}
