import type { NamingContext } from '@rpg/contracts/name-generator'
import { buildCultureContextFields } from '@rpg/name-generator-data'

import type { NameGeneratorFilters } from './name-generator-filters'

export function buildNamingContext(filters: NameGeneratorFilters): NamingContext {
  const cultureFields =
    filters.cultureId !== undefined ? buildCultureContextFields(filters.cultureId) : {}

  return {
    subjectKind: filters.subjectKind,
    ...(filters.languageId !== undefined ? { languageIds: [filters.languageId] } : {}),
    ...(filters.regionId !== undefined ? { regionIds: [filters.regionId] } : {}),
    ...cultureFields,
    ...(filters.speciesId !== undefined ? { speciesIds: [filters.speciesId] } : {}),
  }
}
