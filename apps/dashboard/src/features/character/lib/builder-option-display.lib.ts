import {
  getAbilityLabel,
  type CharacterBuildLanguageOption,
  type CharacterClass,
  type Species,
} from '@rpg/contracts'

import {
  buildSeedCreatureTypeVocabulary,
  buildSeedSenseVocabulary,
  getCreatureTypeLabel,
  getSenseLabelFromVocabulary,
} from '@/features/homebrew'
import {
  buildSpeciesCardViewModel,
  buildSpeciesDetailViewModel,
  SPECIES_SECTION_LABELS,
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

function buildBuilderSpeciesVocabulary(languages: readonly CharacterBuildLanguageOption[]) {
  return {
    resolveCreatureTypeLabel: (id: string) => getCreatureTypeLabel(creatureTypeVocabulary, id),
    resolveLanguageLabel: (id: string) => resolveLanguageLabel(languages, id),
    resolveSenseLabel: (type: string) => getSenseLabelFromVocabulary(senseVocabulary, type),
  }
}

export function formatSpeciesCardOption(species: Species) {
  return buildSpeciesCardViewModel(species, {
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(creatureTypeVocabulary, id),
  })
}

export function formatClassCardOption(characterClass: CharacterClass) {
  const abilities = characterClass.primaryAbilities.map(getAbilityLabel).join(' or ')

  return {
    label: characterClass.name,
    description: `${abilities} · d${characterClass.hitDie} Hit Die`,
  }
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
): SpeciesDetailsSheetContent {
  const viewModel = buildSpeciesDetailViewModel(species, buildBuilderSpeciesVocabulary(languages))

  const sections: BuilderOptionDetailsSection[] = viewModel.sections.map((section) => {
    if (section.id === 'traits') {
      return {
        title: SPECIES_SECTION_LABELS.traits,
        items: section.items.map((item) => ({
          title: item.title,
          body: item.bodyHtml,
        })),
      }
    }

    return {
      title: section.title,
      description: section.descriptionHtml,
      items: section.items.map((item) => ({
        title: item.title,
        body: item.bodyHtml,
      })),
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
