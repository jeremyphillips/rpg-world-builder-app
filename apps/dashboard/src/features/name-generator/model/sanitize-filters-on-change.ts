import type { NamingConvention } from '@rpg/contracts/name-generator'

import { DEFAULT_FILTERS } from './name-generator.constants'
import {
  deriveFilterOptions,
  isFilterValueValid,
  type NameGeneratorFilterContext,
} from './derive-filter-options'
import type { NameGeneratorFilters } from './name-generator-filters'

function stripInvalidOptionalFilters(
  filters: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
  context?: NameGeneratorFilterContext,
): NameGeneratorFilters {
  const options = deriveFilterOptions(filters, conventions, context)
  const next: NameGeneratorFilters = { subjectKind: filters.subjectKind }

  if (isFilterValueValid('speciesId', filters.speciesId, options)) {
    next.speciesId = filters.speciesId
  }
  if (isFilterValueValid('languageId', filters.languageId, options)) {
    next.languageId = filters.languageId
  }
  if (isFilterValueValid('cultureId', filters.cultureId, options)) {
    next.cultureId = filters.cultureId
  }
  if (isFilterValueValid('genderStyle', filters.genderStyle, options)) {
    next.genderStyle = filters.genderStyle
  }

  return next
}

export function sanitizeFiltersOnChange(
  previous: NameGeneratorFilters,
  next: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
  context?: NameGeneratorFilterContext,
): NameGeneratorFilters {
  if (next.subjectKind !== previous.subjectKind) {
    return stripInvalidOptionalFilters(
      {
        subjectKind: next.subjectKind,
      },
      conventions,
      context,
    )
  }

  return stripInvalidOptionalFilters(next, conventions, context)
}

export function resetNameGeneratorFilters(): NameGeneratorFilters {
  return { ...DEFAULT_FILTERS }
}
