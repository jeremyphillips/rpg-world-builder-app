import type { NamingContext } from '@rpg/contracts/name-generator'
import { buildCultureContextFields } from '@rpg/name-generator-data'

import type { NameGeneratorFilters } from './name-generator-filters'

export function buildNamingContext(filters: NameGeneratorFilters): NamingContext {
  const cultureFields =
    filters.cultureId !== undefined ? buildCultureContextFields(filters.cultureId) : {}

  return {
    subjectKind: filters.subjectKind,
    ...(filters.languageId !== undefined ? { languageIds: [filters.languageId] } : {}),
    ...cultureFields,
    ...(filters.speciesId !== undefined ? { speciesIds: [filters.speciesId] } : {}),
  }
}
