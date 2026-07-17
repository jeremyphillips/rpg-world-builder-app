import type { NamingContext } from '@rpg/contracts/name-generator'

import type { NameGeneratorFilters } from './name-generator-filters'

export function buildNamingContext(filters: NameGeneratorFilters): NamingContext {
  return {
    subjectKind: filters.subjectKind,
    ...(filters.languageId !== undefined ? { languageIds: [filters.languageId] } : {}),
    ...(filters.cultureId !== undefined ? { cultureIds: [filters.cultureId] } : {}),
    ...(filters.speciesId !== undefined ? { speciesIds: [filters.speciesId] } : {}),
  }
}
