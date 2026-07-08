import {
  flattenGrantGroups,
  formatMovementDisplay,
  getCreatureSizeLabel,
  resolveCreatureMovement,
  resolveGrantGroupsFromContent,
  resolveTraitDisplay,
  type Species,
  type SpeciesTrait,
} from '@rpg/contracts'

import {
  buildGrantSummaryModel,
  formatGrantSummaryByLevel,
  formatGrantSummaryInline,
  type GrantDisplayVocabulary,
} from '../../lib/grant-display'
import type { ContentStatRowData } from '../../lib/detail/content-stat-rows'

export const SPECIES_STAT_LABELS = {
  creatureType: 'Creature Type',
  size: 'Size',
  movement: 'Movement',
  senses: 'Senses',
  languageAffinities: 'Language affinities',
} as const

export const SPECIES_SECTION_LABELS = { traits: 'Traits' } as const

export type SpeciesDisplayVocabulary = {
  resolveCreatureTypeLabel: (id: string) => string
  resolveLanguageLabel: (id: string) => string
} & Pick<GrantDisplayVocabulary, 'resolveSenseLabel' | 'resolveSpell'>

export type SpeciesDetailItem = {
  id: string
  title: string
  bodyHtml?: string
  /** Grouped grant summary lines, e.g. `L1: Darkvision 120 ft · Dancing Lights cantrip`. */
  summaryLines?: string[]
  /** Flat grant summary for compact surfaces. */
  summaryInline?: string
}

export type SpeciesCardViewModel = {
  label: string
  description: string
  summaryItems: string[]
}

export type SpeciesDetailViewModel = {
  statRows: ContentStatRowData[]
  descriptionHtml?: string
  sections: Array<
    | { id: 'traits'; title: string; items: SpeciesDetailItem[] }
    | {
        id: 'heritage'
        heritageId: string
        title: string
        descriptionHtml?: string
        items: SpeciesDetailItem[]
      }
  >
}

function collectSenses(
  traits: SpeciesTrait[],
  resolveSenseLabel: (type: string) => string,
): string {
  const senses = traits.flatMap((trait) =>
    flattenGrantGroups(resolveGrantGroupsFromContent(trait))
      .map(({ grant }) => grant)
      .filter((grant): grant is Extract<typeof grant, { kind: 'sense' }> => grant.kind === 'sense'),
  )
  if (senses.length === 0) return 'None'
  return senses.map((s) => `${resolveSenseLabel(s.type)} ${s.range} ft.`).join(', ')
}

function buildSpeciesStatRows(
  species: Species,
  vocabulary: SpeciesDisplayVocabulary,
): ContentStatRowData[] {
  const rows: ContentStatRowData[] = [
    {
      label: SPECIES_STAT_LABELS.creatureType,
      value: vocabulary.resolveCreatureTypeLabel(species.creatureType),
    },
    {
      label: SPECIES_STAT_LABELS.size,
      value: species.sizes.map(getCreatureSizeLabel).join(' or '),
    },
    {
      label: SPECIES_STAT_LABELS.movement,
      value: formatMovementDisplay(resolveCreatureMovement(species)),
    },
    {
      label: SPECIES_STAT_LABELS.senses,
      value: collectSenses(species.traits, vocabulary.resolveSenseLabel),
    },
  ]

  if (species.languageAffinities?.length) {
    rows.push({
      label: SPECIES_STAT_LABELS.languageAffinities,
      value: species.languageAffinities.map((id) => vocabulary.resolveLanguageLabel(id)).join(', '),
    })
  }

  return rows
}

function mapTraitToDetailItem(trait: SpeciesTrait): SpeciesDetailItem {
  const display = resolveTraitDisplay(trait)
  return {
    id: trait.id,
    title: display.name,
    bodyHtml: display.descriptionHtml,
  }
}

function toGrantDisplayVocabulary(vocabulary: SpeciesDisplayVocabulary): GrantDisplayVocabulary {
  return {
    resolveSenseLabel: vocabulary.resolveSenseLabel,
    resolveSpell: vocabulary.resolveSpell,
  }
}

function mapHeritageOptionToDetailItem(
  trait: SpeciesTrait,
  vocabulary: SpeciesDisplayVocabulary,
): SpeciesDetailItem {
  const display = resolveTraitDisplay(trait)
  const grantVocabulary = toGrantDisplayVocabulary(vocabulary)
  const summaryModel = buildGrantSummaryModel(trait.grantGroups, grantVocabulary, {
    parentLevel: 1,
  })
  const groupedSummary = formatGrantSummaryByLevel(summaryModel, { includeTypeSuffix: true })

  if (groupedSummary.length === 0) {
    return mapTraitToDetailItem(trait)
  }

  return {
    id: trait.id,
    title: display.name,
    bodyHtml: display.descriptionHtml,
    summaryLines: groupedSummary.map(({ label, text }) => `${label}: ${text}`),
    summaryInline: formatGrantSummaryInline(summaryModel),
  }
}

export function buildSpeciesCardViewModel(
  species: Species,
  vocabulary: Pick<SpeciesDisplayVocabulary, 'resolveCreatureTypeLabel'>,
): SpeciesCardViewModel {
  return {
    label: species.name,
    description: vocabulary.resolveCreatureTypeLabel(species.creatureType),
    summaryItems: species.traits.map((trait) => resolveTraitDisplay(trait).name),
  }
}

export function buildSpeciesDetailViewModel(
  species: Species,
  vocabulary: SpeciesDisplayVocabulary,
): SpeciesDetailViewModel {
  const sections: SpeciesDetailViewModel['sections'] = []

  if (species.traits.length > 0) {
    sections.push({
      id: 'traits',
      title: SPECIES_SECTION_LABELS.traits,
      items: species.traits.map(mapTraitToDetailItem),
    })
  }

  if (species.heritage) {
    sections.push({
      id: 'heritage',
      heritageId: species.heritage.id,
      title: species.heritage.name,
      descriptionHtml: species.heritage.description,
      items: species.heritage.options.map((option) =>
        mapHeritageOptionToDetailItem(option, vocabulary),
      ),
    })
  }

  return {
    statRows: buildSpeciesStatRows(species, vocabulary),
    descriptionHtml: species.description,
    sections,
  }
}
