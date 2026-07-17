import type {
  NamingContext,
  NamingConvention,
  NamingRecommendation,
} from '@rpg/contracts/name-generator'
import { recommendConventions } from '@rpg/name-generator-core'

import type { NameGeneratorFilters } from './name-generator-filters'

function matchSatisfiesSelectedFilters(
  match: NamingRecommendation,
  filters: Pick<NameGeneratorFilters, 'languageId' | 'cultureId' | 'speciesId'>,
): boolean {
  if (filters.languageId !== undefined) {
    const hasLanguage = match.reasons.some(
      (reason) => reason.kind === 'language' && reason.languageId === filters.languageId,
    )
    if (!hasLanguage) {
      return false
    }
  }

  if (filters.cultureId !== undefined) {
    const hasCulture = match.reasons.some(
      (reason) => reason.kind === 'culture' && reason.cultureId === filters.cultureId,
    )
    if (!hasCulture) {
      return false
    }
  }

  if (filters.speciesId !== undefined) {
    const hasSpecies = match.reasons.some(
      (reason) => reason.kind === 'species' && reason.speciesId === filters.speciesId,
    )
    if (!hasSpecies) {
      return false
    }
  }

  return true
}

export function recommendNameGeneratorMatches(
  context: NamingContext,
  conventions: readonly NamingConvention[],
  filters: Pick<NameGeneratorFilters, 'languageId' | 'cultureId' | 'speciesId'> = {},
): NamingRecommendation[] {
  const eligibleConventions = conventions.filter((convention) =>
    convention.subjectKinds.includes(context.subjectKind),
  )

  return recommendConventions(context, eligibleConventions).filter((match) =>
    matchSatisfiesSelectedFilters(match, filters),
  )
}
