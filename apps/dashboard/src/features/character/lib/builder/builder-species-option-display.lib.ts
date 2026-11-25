import {
  type CharacterBuildLanguageOption,
  type Species,
  type SpellCatalogContext,
} from '@rpg/contracts'

import { getContentTypeItemLabel } from '@/features/content'
import {
  buildSeedCreatureTypeVocabulary,
  buildSeedSenseVocabulary,
  getCreatureTypeLabel,
  getSenseLabelFromVocabulary,
} from '@/features/vocabulary'
import {
  buildSpeciesCardViewModel,
  buildSpeciesDetailViewModel,
  SPECIES_SECTION_LABELS,
  type SpeciesDetailItem,
} from '@/features/content'

import type { BuilderOptionDetailsSection } from '@rpg/ui'

export const BUILDER_SPECIES_EYEBROW = getContentTypeItemLabel('species')

export function buildBuilderSpeciesVocabulary(
  languages: readonly CharacterBuildLanguageOption[],
  spellCatalog: SpellCatalogContext,
) {
  const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()
  const senseVocabulary = buildSeedSenseVocabulary()

  return {
    resolveCreatureTypeLabel: (id: string) => getCreatureTypeLabel(creatureTypeVocabulary, id),
    resolveLanguageLabel: (id: string) => languages.find((entry) => entry.id === id)?.label,
    resolveSenseLabel: (type: string) => getSenseLabelFromVocabulary(senseVocabulary, type),
    spellCatalog,
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
  return buildSpeciesCardViewModel(species)
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
  spellCatalog: SpellCatalogContext,
): SpeciesDetailsSheetContent {
  const viewModel = buildSpeciesDetailViewModel(
    species,
    buildBuilderSpeciesVocabulary(languages, spellCatalog),
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
