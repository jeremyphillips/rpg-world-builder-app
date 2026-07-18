import type {
  NamingAssociation,
  NamingConvention,
  NameSubjectKind,
} from '@rpg/contracts/name-generator'
import { NAME_SUBJECT_KIND_ENTRIES, toVocabOptions } from '@rpg/contracts/name-generator'
import { getLanguageLabel } from '@rpg/contracts'
import type { SpeciesNamingOption } from '@rpg/name-generator-integrations'
import { getConventionCultureId, STANDALONE_NAMING_CULTURES } from '@rpg/name-generator-data'

import type { NamingCultureFilterContext } from './compose-name-generator-conventions'
import {
  GENDER_STYLE_LABELS,
  PERSON_GENDER_STYLES,
  SUBJECTS_WITH_GENDER_FILTER,
  SUBJECTS_WITH_LANGUAGE_CULTURE_FILTER,
  SUBJECTS_WITH_SPECIES_FILTER,
} from './name-generator.constants'
import type {
  FilterOption,
  NameGeneratorFilterOptions,
  NameGeneratorFilters,
  NameGeneratorVisibleFilters,
} from './name-generator-filters'

type PartialFilters = Pick<
  NameGeneratorFilters,
  'subjectKind' | 'speciesId' | 'languageId' | 'cultureId'
>

export type NameGeneratorFilterContext = {
  speciesNamingOptions: SpeciesNamingOption[]
  cultures: NamingCultureFilterContext[]
}

function getCultureLanguageIds(
  cultureId: string,
  cultures: readonly NamingCultureFilterContext[],
): readonly string[] {
  return cultures.find((entry) => entry.id === cultureId)?.languageIds ?? []
}

function cultureMatchesLanguage(
  cultureId: string,
  languageId: string,
  cultures: readonly NamingCultureFilterContext[],
): boolean {
  return getCultureLanguageIds(cultureId, cultures).includes(languageId)
}

function conventionHasLanguage(
  convention: NamingConvention,
  languageId: string,
  cultures: readonly NamingCultureFilterContext[],
): boolean {
  if (
    convention.associations.some(
      (association) => association.kind === 'language' && association.languageId === languageId,
    )
  ) {
    return true
  }

  return convention.associations.some(
    (association) =>
      association.kind === 'culture' &&
      cultureMatchesLanguage(association.cultureId, languageId, cultures),
  )
}

function conventionHasCulture(convention: NamingConvention, cultureId: string): boolean {
  const conventionCultureId = getConventionCultureId(cultureId)
  return convention.associations.some(
    (association) =>
      association.kind === 'culture' && association.cultureId === conventionCultureId,
  )
}

function conventionMatchesSpecies(
  convention: NamingConvention,
  speciesId: string,
  speciesNamingOptions: readonly SpeciesNamingOption[],
): boolean {
  const option = speciesNamingOptions.find((entry) => entry.speciesId === speciesId)
  if (option === undefined || option.disabled) {
    return false
  }

  const speciesAssociations = convention.associations.filter(
    (association) => association.kind === 'species',
  )
  if (speciesAssociations.length > 0) {
    return speciesAssociations.some(
      (association) => association.kind === 'species' && association.speciesId === speciesId,
    )
  }

  return option.cultureIds.some((cultureId) => conventionHasCulture(convention, cultureId))
}

export function filterConventionsByPartialFilters(
  conventions: readonly NamingConvention[],
  filters: PartialFilters,
  context?: NameGeneratorFilterContext,
): NamingConvention[] {
  const speciesNamingOptions = context?.speciesNamingOptions ?? []
  const cultures = context?.cultures ?? []

  return conventions.filter((convention) => {
    if (!convention.subjectKinds.includes(filters.subjectKind)) {
      return false
    }

    if (
      filters.speciesId !== undefined &&
      !conventionMatchesSpecies(convention, filters.speciesId, speciesNamingOptions)
    ) {
      return false
    }

    if (
      filters.languageId !== undefined &&
      !conventionHasLanguage(convention, filters.languageId, cultures)
    ) {
      return false
    }

    if (filters.cultureId !== undefined && !conventionHasCulture(convention, filters.cultureId)) {
      return false
    }

    return true
  })
}

function collectAssociationIds(
  conventions: readonly NamingConvention[],
  kind: NamingAssociation['kind'],
): string[] {
  const ids = new Set<string>()

  for (const convention of conventions) {
    for (const association of convention.associations) {
      if (association.kind !== kind) {
        continue
      }

      switch (association.kind) {
        case 'language':
          ids.add(association.languageId)
          break
        case 'culture':
          ids.add(association.cultureId)
          break
        case 'species':
          ids.add(association.speciesId)
          break
        default:
          break
      }
    }
  }

  return [...ids]
}

const subjectKindLabelById = new Map(
  toVocabOptions(NAME_SUBJECT_KIND_ENTRIES).map((option) => [option.value, option.label]),
)

function buildSubjectOptions(conventions: readonly NamingConvention[]): FilterOption[] {
  const ids = new Set<NameSubjectKind>()
  for (const convention of conventions) {
    for (const subjectKind of convention.subjectKinds) {
      ids.add(subjectKind)
    }
  }

  return [...ids]
    .sort((left, right) => left.localeCompare(right))
    .map((id) => {
      const label = subjectKindLabelById.get(id)
      if (label === undefined) {
        throw new Error(`Missing subject kind label for "${id}"`)
      }

      return { id, label }
    })
}

function buildSpeciesOptions(speciesNamingOptions: readonly SpeciesNamingOption[]): FilterOption[] {
  return speciesNamingOptions
    .filter((option) => !option.disabled)
    .map((option) => ({
      id: option.speciesId,
      label: option.label,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

function buildLanguageOptions(
  conventions: readonly NamingConvention[],
  cultures: readonly NamingCultureFilterContext[],
): FilterOption[] {
  const ids = new Set(collectAssociationIds(conventions, 'language'))

  for (const cultureId of collectAssociationIds(conventions, 'culture')) {
    for (const languageId of getCultureLanguageIds(cultureId, cultures)) {
      ids.add(languageId)
    }
  }

  for (const culture of cultures) {
    for (const languageId of culture.languageIds) {
      ids.add(languageId)
    }
  }

  return [...ids]
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({
      id,
      label: getLanguageLabel(id),
    }))
}

function getStandaloneCultureLanguageIds(
  culture: (typeof STANDALONE_NAMING_CULTURES)[number],
): readonly string[] {
  if (!('languageIds' in culture) || !Array.isArray(culture.languageIds)) {
    return []
  }

  return culture.languageIds
}

function buildCultureOptions(
  conventions: readonly NamingConvention[],
  filters: PartialFilters,
  cultures: readonly NamingCultureFilterContext[],
  speciesNamingOptions: readonly SpeciesNamingOption[],
): FilterOption[] {
  const referencedCultureIds = new Set(collectAssociationIds(conventions, 'culture'))
  const selectableCultures = new Map<string, NamingCultureFilterContext>()

  for (const culture of cultures) {
    if (referencedCultureIds.has(culture.id)) {
      selectableCultures.set(culture.id, culture)
    }
  }

  for (const culture of STANDALONE_NAMING_CULTURES) {
    if (referencedCultureIds.has(culture.id)) {
      selectableCultures.set(culture.id, {
        id: culture.id,
        label: culture.label,
        languageIds: getStandaloneCultureLanguageIds(culture),
      })
    }
  }

  if (filters.speciesId !== undefined) {
    const speciesOption = speciesNamingOptions.find(
      (option) => option.speciesId === filters.speciesId,
    )
    if (speciesOption !== undefined && !speciesOption.disabled) {
      for (const cultureId of speciesOption.cultureIds) {
        const culture = cultures.find((entry) => entry.id === cultureId)
        if (culture !== undefined) {
          selectableCultures.set(culture.id, culture)
        }
      }
    }
  }

  return [...selectableCultures.values()]
    .map((culture) => ({
      id: culture.id,
      label: culture.label,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

function buildGenderStyleOptions(): FilterOption[] {
  return PERSON_GENDER_STYLES.map((id) => ({
    id,
    label: GENDER_STYLE_LABELS[id],
  }))
}

function subjectConventionsHaveLanguageData(
  subjectConventions: readonly NamingConvention[],
  cultures: readonly NamingCultureFilterContext[],
): boolean {
  if (collectAssociationIds(subjectConventions, 'language').length > 0) {
    return true
  }

  return (
    collectAssociationIds(subjectConventions, 'culture').some(
      (cultureId) => getCultureLanguageIds(cultureId, cultures).length > 0,
    ) || cultures.some((culture) => culture.languageIds.length > 0)
  )
}

export function deriveVisibleFilters(
  filters: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
  context?: NameGeneratorFilterContext,
): NameGeneratorVisibleFilters {
  const cultures = context?.cultures ?? []
  const speciesNamingOptions = context?.speciesNamingOptions ?? []
  const subjectConventions = conventions.filter((convention) =>
    convention.subjectKinds.includes(filters.subjectKind),
  )

  const hasLanguageAssociations = subjectConventionsHaveLanguageData(subjectConventions, cultures)
  const hasCultureAssociations =
    collectAssociationIds(subjectConventions, 'culture').length > 0 || cultures.length > 0
  const hasSpeciesAssociations =
    collectAssociationIds(subjectConventions, 'species').length > 0 ||
    speciesNamingOptions.some((option) => !option.disabled)

  const showLanguageCulture = SUBJECTS_WITH_LANGUAGE_CULTURE_FILTER.has(filters.subjectKind)

  return {
    species: SUBJECTS_WITH_SPECIES_FILTER.has(filters.subjectKind) && hasSpeciesAssociations,
    language: showLanguageCulture && hasLanguageAssociations,
    culture: showLanguageCulture && hasCultureAssociations,
    genderStyle: SUBJECTS_WITH_GENDER_FILTER.has(filters.subjectKind),
  }
}

export function deriveFilterOptions(
  filters: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
  context?: NameGeneratorFilterContext,
): NameGeneratorFilterOptions {
  const languageConventions = filterConventionsByPartialFilters(
    conventions,
    {
      subjectKind: filters.subjectKind,
      speciesId: filters.speciesId,
      cultureId: filters.cultureId,
    },
    context,
  )
  const cultureConventions = filterConventionsByPartialFilters(
    conventions,
    {
      subjectKind: filters.subjectKind,
      speciesId: filters.speciesId,
      languageId: filters.languageId,
    },
    context,
  )

  const cultures = context?.cultures ?? []
  const speciesNamingOptions = context?.speciesNamingOptions ?? []

  return {
    subjectKinds: buildSubjectOptions(conventions),
    speciesIds: buildSpeciesOptions(speciesNamingOptions),
    languageIds: buildLanguageOptions(languageConventions, cultures),
    cultureIds: buildCultureOptions(cultureConventions, filters, cultures, speciesNamingOptions),
    genderStyles: buildGenderStyleOptions(),
  }
}

export function isFilterValueValid(
  filterKey: keyof NameGeneratorFilters,
  value: string | undefined,
  options: NameGeneratorFilterOptions,
): boolean {
  if (value === undefined) {
    return true
  }

  switch (filterKey) {
    case 'subjectKind':
      return options.subjectKinds.some((option) => option.id === value)
    case 'speciesId':
      return options.speciesIds.some((option) => option.id === value)
    case 'languageId':
      return options.languageIds.some((option) => option.id === value)
    case 'cultureId':
      return options.cultureIds.some((option) => option.id === value)
    case 'genderStyle':
      return options.genderStyles.some((option) => option.id === value)
    default:
      return true
  }
}
