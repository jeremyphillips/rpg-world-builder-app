import {
  formatSpeed,
  getAbilityLabel,
  getCreatureSizeLabel,
  resolveTraitDisplay,
  type CharacterBuildLanguageOption,
  type CharacterClass,
  type Species,
} from '@rpg/contracts'

import { buildSeedCreatureTypeVocabulary, getCreatureTypeLabel } from '@/features/homebrew'

import type { BuilderOptionDetailsSection } from '@rpg/ui'

const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()

export const BUILDER_SPECIES_EYEBROW = 'Species'

const METADATA_LABEL_CREATURE_TYPE = 'Creature Type'
const METADATA_LABEL_SIZE = 'Size'
const METADATA_LABEL_SPEED = 'Speed'
const METADATA_LABEL_LANGUAGE_AFFINITIES = 'Language affinities'

const SECTION_TITLE_TRAITS = 'Traits'

function resolveLanguageLabel(
  languages: readonly CharacterBuildLanguageOption[],
  languageId: string,
): string {
  return languages.find((entry) => entry.id === languageId)?.label ?? languageId
}

export function formatSpeciesCardOption(species: Species) {
  return {
    label: species.name,
    description: getCreatureTypeLabel(creatureTypeVocabulary, species.creatureType),
    summaryItems: species.traits.map((trait) => resolveTraitDisplay(trait).name),
  }
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
  const metadata: SpeciesDetailsSheetContent['metadata'] = [
    {
      label: METADATA_LABEL_CREATURE_TYPE,
      value: getCreatureTypeLabel(creatureTypeVocabulary, species.creatureType),
    },
    {
      label: METADATA_LABEL_SIZE,
      value: species.sizes.map(getCreatureSizeLabel).join(' or '),
    },
    {
      label: METADATA_LABEL_SPEED,
      value: formatSpeed(species.speed),
    },
  ]

  if (species.languageAffinities?.length) {
    metadata.push({
      label: METADATA_LABEL_LANGUAGE_AFFINITIES,
      value: species.languageAffinities
        .map((languageId) => resolveLanguageLabel(languages, languageId))
        .join(', '),
    })
  }

  const sections: BuilderOptionDetailsSection[] = []

  if (species.traits.length > 0) {
    sections.push({
      title: SECTION_TITLE_TRAITS,
      items: species.traits.map((trait) => {
        const display = resolveTraitDisplay(trait)
        return {
          title: display.name,
          body: display.descriptionHtml,
        }
      }),
    })
  }

  if (species.heritage) {
    sections.push({
      title: species.heritage.name,
      description: species.heritage.description,
      items: species.heritage.options.map((option) => {
        const display = resolveTraitDisplay(option)
        return {
          title: display.name,
          body: display.descriptionHtml,
        }
      }),
    })
  }

  return {
    title: species.name,
    eyebrow: BUILDER_SPECIES_EYEBROW,
    descriptionHtml: species.description,
    metadata,
    sections,
  }
}
