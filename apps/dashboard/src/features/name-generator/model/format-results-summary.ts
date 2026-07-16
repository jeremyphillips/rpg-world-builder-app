import { getLanguageLabel } from '@rpg/contracts'
import { loadSeedSpecies } from '@rpg/catalog/species'
import type { NamingRecommendation } from '@rpg/contracts/name-generator'
import { getConvention } from '@rpg/name-generator-data'

import { DEFAULT_RULESET_ID, GENDER_STYLE_LABELS } from './name-generator.constants'
import type { NameGeneratorFilters, NameGeneratorResultsSummary } from './name-generator-filters'

function getSpeciesLabel(speciesId: string | undefined): string | undefined {
  if (speciesId === undefined) {
    return undefined
  }

  const species = loadSeedSpecies(DEFAULT_RULESET_ID).find((entry) => entry.id === speciesId)
  return species?.name ?? speciesId
}

function buildFilterSubtitle(filters: NameGeneratorFilters): string | undefined {
  const segments = [
    filters.languageId !== undefined ? getLanguageLabel(filters.languageId) : undefined,
    getSpeciesLabel(filters.speciesId),
    filters.genderStyle !== undefined ? GENDER_STYLE_LABELS[filters.genderStyle] : undefined,
  ].filter((segment): segment is string => segment !== undefined)

  return segments.length > 0 ? segments.join(' · ') : undefined
}

function getDominantLanguageLabel(
  filters: NameGeneratorFilters,
  matches: readonly NamingRecommendation[],
): string | undefined {
  if (filters.languageId !== undefined) {
    return getLanguageLabel(filters.languageId)
  }

  for (const match of matches) {
    const languageReason = match.reasons.find((reason) => reason.kind === 'language')
    if (languageReason?.kind === 'language') {
      return getLanguageLabel(languageReason.languageId)
    }
  }

  return undefined
}

export function formatResultsSummary(
  filters: NameGeneratorFilters,
  matches: readonly NamingRecommendation[],
  partialCount?: { generated: number; requested: number },
): NameGeneratorResultsSummary {
  if (partialCount !== undefined && partialCount.generated < partialCount.requested) {
    return {
      title: `Generated ${partialCount.generated} of ${partialCount.requested} unique names.`,
      tone: 'warning',
    }
  }

  if (matches.length === 1) {
    const convention = getConvention(matches[0]?.conventionId ?? '')
    return {
      title: convention?.label ?? 'Generated names',
      subtitle: buildFilterSubtitle(filters),
    }
  }

  const languageLabel = getDominantLanguageLabel(filters, matches)
  const languageSegment = languageLabel !== undefined ? `${languageLabel} ` : ''

  return {
    title: `Generated from ${matches.length} matching ${languageSegment}conventions`.replace(
      /\s+/g,
      ' ',
    ),
    subtitle: buildFilterSubtitle(filters),
  }
}

export function formatMatchCountLabel(matchCount: number): string {
  if (matchCount === 0) {
    return 'No naming conventions match these filters.'
  }

  if (matchCount === 1) {
    return '1 matching naming convention'
  }

  return `${matchCount} matching naming conventions`
}
