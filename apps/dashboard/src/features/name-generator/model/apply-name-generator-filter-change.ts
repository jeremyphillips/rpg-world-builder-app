import type {
  NamingConvention,
  NameGenderStyle,
  NameSubjectKind,
} from '@rpg/contracts/name-generator'
import type { SpeciesNamingOption } from '@rpg/name-generator-integrations'

import type { NamingCultureFilterContext } from './compose-name-generator-conventions'
import type { NameGeneratorFilters } from './name-generator-filters'

function conventionSupportsLanguageFilter(
  conventions: readonly NamingConvention[],
  languageId: string,
): boolean {
  return conventions.some((convention) =>
    convention.associations.some(
      (association) => association.kind === 'language' && association.languageId === languageId,
    ),
  )
}

function applySpeciesFilterSideEffects({
  next,
  previous,
  speciesId,
  speciesNamingOptions,
  conventions,
  cultureContexts,
}: {
  next: NameGeneratorFilters
  previous: NameGeneratorFilters
  speciesId: string
  speciesNamingOptions: readonly SpeciesNamingOption[]
  conventions: readonly NamingConvention[]
  cultureContexts: readonly NamingCultureFilterContext[]
}): void {
  const speciesOption = speciesNamingOptions.find((option) => option.speciesId === speciesId)
  if (speciesOption === undefined || speciesOption.disabled) {
    return
  }

  next.cultureId = speciesOption.cultureIds[0]

  const primaryCultureId = speciesOption.cultureIds[0]
  if (primaryCultureId === undefined) {
    return
  }

  const cultureContext = cultureContexts.find((culture) => culture.id === primaryCultureId)
  const singleLanguageId = cultureContext?.languageIds[0]
  if (
    previous.languageId !== undefined ||
    cultureContext === undefined ||
    cultureContext.languageIds.length !== 1 ||
    singleLanguageId === undefined
  ) {
    return
  }

  const speciesConventions = conventions.filter((convention) =>
    speciesOption.cultureIds.some((cultureId) =>
      convention.associations.some(
        (association) => association.kind === 'culture' && association.cultureId === cultureId,
      ),
    ),
  )

  if (conventionSupportsLanguageFilter(speciesConventions, singleLanguageId)) {
    next.languageId = singleLanguageId
  }
}

export function applyNameGeneratorFilterChange({
  filters,
  key,
  value,
  speciesNamingOptions,
  conventions,
  cultureContexts,
}: {
  filters: NameGeneratorFilters
  key: keyof NameGeneratorFilters
  value: string | undefined
  speciesNamingOptions: readonly SpeciesNamingOption[]
  conventions: readonly NamingConvention[]
  cultureContexts: readonly NamingCultureFilterContext[]
}): NameGeneratorFilters {
  const next: NameGeneratorFilters = { ...filters }

  if (key === 'subjectKind') {
    next.subjectKind = (value ?? 'person') as NameSubjectKind
    return next
  }

  if (value === undefined || value === '') {
    delete next[key]
    return next
  }

  switch (key) {
    case 'genderStyle':
      next.genderStyle = value as NameGenderStyle
      break
    case 'speciesId':
      next.speciesId = value
      applySpeciesFilterSideEffects({
        next,
        previous: filters,
        speciesId: value,
        speciesNamingOptions,
        conventions,
        cultureContexts,
      })
      break
    case 'languageId':
      next.languageId = value
      break
    case 'cultureId':
      next.cultureId = value
      break
    default:
      break
  }

  return next
}
