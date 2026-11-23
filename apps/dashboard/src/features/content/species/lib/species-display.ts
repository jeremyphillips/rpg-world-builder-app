import {
  formatCreatureSensesCompactList,
  formatMovementDisplay,
  CREATURE_SIZE_TERM,
  CREATURE_TYPE_TERM,
  formatCreatureSizeList,
  getVocabularyTermLabel,
  resolveCreatureMovement,
  resolveCreatureSenses,
  resolveCreatureTraitGrants,
  type Species,
  type SpeciesBodyTrait,
} from '@rpg/contracts'

import {
  buildGrantSummaryModel,
  formatGrantSummaryByLevel,
  formatGrantSummaryInline,
  type GrantDisplayVocabulary,
} from '../../lib/forms/grants/grant-display'
import { resolveFacing } from '../../facing/resolve-facing'
import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'
import {
  projectVisibleHeritageOptions,
  projectVisibleSpeciesTraits,
  resolveSpeciesDisplayAccess,
  type SpeciesDisplayProjectionContext,
} from './species-display-projection'

export const SPECIES_STAT_LABELS = {
  creatureType: getVocabularyTermLabel(CREATURE_TYPE_TERM),
  size: getVocabularyTermLabel(CREATURE_SIZE_TERM),
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
  summaryItems: string[]
}

const SPECIES_CARD_SUMMARY_MAX_ITEMS = 3

function truncateSpeciesCardSummaryItems(items: readonly string[]): string[] {
  if (items.length <= SPECIES_CARD_SUMMARY_MAX_ITEMS) {
    return [...items]
  }

  const overflowCount = items.length - SPECIES_CARD_SUMMARY_MAX_ITEMS
  return [...items.slice(0, SPECIES_CARD_SUMMARY_MAX_ITEMS), `+${overflowCount} more`]
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

function collectSenses(traits: SpeciesBodyTrait[]): string {
  const senses = resolveCreatureSenses({
    grants: resolveCreatureTraitGrants(traits.map((trait) => ({ trait, source: trait.id }))).map(
      (resolved) => resolved.grant,
    ),
  })
  if (senses.length === 0) return 'None'
  return formatCreatureSensesCompactList(senses)
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
      value: formatCreatureSizeList(species.sizes),
    },
    {
      label: SPECIES_STAT_LABELS.movement,
      value: formatMovementDisplay(resolveCreatureMovement(species)),
    },
    {
      label: SPECIES_STAT_LABELS.senses,
      value: collectSenses(species.traits),
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

function facingTitleAndBody(trait: SpeciesBodyTrait): { title: string; bodyHtml?: string } {
  const resolution = resolveFacing({ domain: 'trait', source: 'persisted', trait })
  if (resolution.status === 'ready') {
    const richText = resolution.document.blocks.find((block) => block.kind === 'richText')
    return {
      title: resolution.document.title,
      bodyHtml: richText?.kind === 'richText' ? richText.html : undefined,
    }
  }
  return { title: trait.kind === 'custom' ? trait.name : trait.id }
}

function mapTraitToDetailItem(trait: SpeciesBodyTrait): SpeciesDetailItem {
  const { title, bodyHtml } = facingTitleAndBody(trait)
  return {
    id: trait.id,
    title,
    bodyHtml,
  }
}

function toGrantDisplayVocabulary(vocabulary: SpeciesDisplayVocabulary): GrantDisplayVocabulary {
  return {
    resolveSenseLabel: vocabulary.resolveSenseLabel,
    resolveSpell: vocabulary.resolveSpell,
  }
}

function mapHeritageOptionToDetailItem(
  trait: SpeciesBodyTrait,
  vocabulary: SpeciesDisplayVocabulary,
): SpeciesDetailItem {
  const { title, bodyHtml } = facingTitleAndBody(trait)
  const grantVocabulary = toGrantDisplayVocabulary(vocabulary)
  const summaryModel = buildGrantSummaryModel(
    trait.kind === 'template' ? undefined : trait.grantGroups,
    grantVocabulary,
    {
      parentLevel: 1,
    },
  )
  const groupedSummary = formatGrantSummaryByLevel(summaryModel, { includeTypeSuffix: true })

  if (groupedSummary.length === 0) {
    return mapTraitToDetailItem(trait)
  }

  return {
    id: trait.id,
    title,
    bodyHtml,
    summaryLines: groupedSummary.map(({ label, text }) => `${label}: ${text}`),
    summaryInline: formatGrantSummaryInline(summaryModel),
  }
}

export function buildSpeciesCardViewModel(species: Species): SpeciesCardViewModel {
  return {
    label: species.name,
    summaryItems: truncateSpeciesCardSummaryItems(
      species.traits.map((trait) => facingTitleAndBody(trait).title),
    ),
  }
}

export function buildSpeciesDetailViewModel(
  species: Species,
  vocabulary: SpeciesDisplayVocabulary,
  projection?: SpeciesDisplayProjectionContext,
): SpeciesDetailViewModel {
  const sections: SpeciesDetailViewModel['sections'] = []
  const projectionCtx = projection ?? {
    speciesAccess: resolveSpeciesDisplayAccess(species),
  }
  const visibleTraits = projectVisibleSpeciesTraits(species.traits, projectionCtx)

  if (visibleTraits.length > 0) {
    sections.push({
      id: 'traits',
      title: SPECIES_SECTION_LABELS.traits,
      items: visibleTraits.map(mapTraitToDetailItem),
    })
  }

  if (species.heritage) {
    const visibleOptions = projectVisibleHeritageOptions(species.heritage.options, projectionCtx)
    if (visibleOptions.length > 0) {
      sections.push({
        id: 'heritage',
        heritageId: species.heritage.id,
        title: species.heritage.name,
        descriptionHtml: species.heritage.description,
        items: visibleOptions.map((option) => mapHeritageOptionToDetailItem(option, vocabulary)),
      })
    }
  }

  return {
    statRows: buildSpeciesStatRows({ ...species, traits: visibleTraits }, vocabulary),
    descriptionHtml: species.description,
    sections,
  }
}
