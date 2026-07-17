import type {
  NamingAssociation,
  NamingConvention,
  NameSubjectKind,
} from '@rpg/contracts/name-generator'
import { getLanguageLabel } from '@rpg/contracts'
import { loadSeedSpecies } from '@rpg/catalog/species'
import { NAME_CULTURES, getConventionCultureId } from '@rpg/name-generator-data'

import {
  DEFAULT_RULESET_ID,
  GENDER_STYLE_LABELS,
  PERSON_GENDER_STYLES,
  SUBJECT_KIND_LABELS,
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

function getCultureLanguageIds(cultureId: string): readonly string[] {
  const culture = NAME_CULTURES.find((entry) => entry.id === cultureId)
  if (culture === undefined || !('languageIds' in culture)) {
    return []
  }

  return culture.languageIds
}

function cultureMatchesLanguage(cultureId: string, languageId: string): boolean {
  return getCultureLanguageIds(cultureId).includes(languageId)
}

function conventionHasLanguage(convention: NamingConvention, languageId: string): boolean {
  if (
    convention.associations.some(
      (association) => association.kind === 'language' && association.languageId === languageId,
    )
  ) {
    return true
  }

  return convention.associations.some(
    (association) =>
      association.kind === 'culture' && cultureMatchesLanguage(association.cultureId, languageId),
  )
}

function isCultureSelectable(culture: (typeof NAME_CULTURES)[number]): boolean {
  return !('selectable' in culture && culture.selectable === false)
}

function conventionHasCulture(convention: NamingConvention, cultureId: string): boolean {
  const conventionCultureId = getConventionCultureId(cultureId)
  return convention.associations.some(
    (association) =>
      association.kind === 'culture' && association.cultureId === conventionCultureId,
  )
}

function conventionHasSpecies(convention: NamingConvention, speciesId: string): boolean {
  return convention.associations.some(
    (association) => association.kind === 'species' && association.speciesId === speciesId,
  )
}

export function filterConventionsByPartialFilters(
  conventions: readonly NamingConvention[],
  filters: PartialFilters,
): NamingConvention[] {
  return conventions.filter((convention) => {
    if (!convention.subjectKinds.includes(filters.subjectKind)) {
      return false
    }

    if (filters.speciesId !== undefined && !conventionHasSpecies(convention, filters.speciesId)) {
      return false
    }

    if (
      filters.languageId !== undefined &&
      !conventionHasLanguage(convention, filters.languageId)
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

function buildSubjectOptions(conventions: readonly NamingConvention[]): FilterOption[] {
  const ids = new Set<NameSubjectKind>()
  for (const convention of conventions) {
    for (const subjectKind of convention.subjectKinds) {
      ids.add(subjectKind)
    }
  }

  return [...ids]
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({
      id,
      label: SUBJECT_KIND_LABELS[id] ?? id,
    }))
}

function buildSpeciesOptions(conventions: readonly NamingConvention[]): FilterOption[] {
  const speciesById = new Map(
    loadSeedSpecies(DEFAULT_RULESET_ID).map((species) => [species.id, species]),
  )
  return collectAssociationIds(conventions, 'species')
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({
      id,
      label: speciesById.get(id)?.name ?? id,
    }))
}

function buildLanguageOptions(conventions: readonly NamingConvention[]): FilterOption[] {
  const ids = new Set(collectAssociationIds(conventions, 'language'))

  for (const cultureId of collectAssociationIds(conventions, 'culture')) {
    for (const languageId of getCultureLanguageIds(cultureId)) {
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

function buildCultureOptions(
  conventions: readonly NamingConvention[],
  filters: PartialFilters,
): FilterOption[] {
  const referencedCultureIds = new Set(collectAssociationIds(conventions, 'culture'))
  const selectableCultures = new Map<string, (typeof NAME_CULTURES)[number]>()

  for (const culture of NAME_CULTURES) {
    if (!isCultureSelectable(culture)) {
      continue
    }

    if (referencedCultureIds.has(culture.id)) {
      selectableCultures.set(culture.id, culture)
    }
  }

  if (filters.speciesId !== undefined) {
    for (const culture of NAME_CULTURES) {
      if (!isCultureSelectable(culture)) {
        continue
      }

      if (
        'speciesIds' in culture &&
        (culture.speciesIds as readonly string[]).includes(filters.speciesId)
      ) {
        selectableCultures.set(culture.id, culture)
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

export function deriveVisibleFilters(
  filters: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
): NameGeneratorVisibleFilters {
  const subjectConventions = conventions.filter((convention) =>
    convention.subjectKinds.includes(filters.subjectKind),
  )

  const hasLanguageAssociations =
    collectAssociationIds(subjectConventions, 'language').length > 0 ||
    collectAssociationIds(subjectConventions, 'culture').some(
      (cultureId) => getCultureLanguageIds(cultureId).length > 0,
    )

  const hasCultureAssociations = collectAssociationIds(subjectConventions, 'culture').length > 0
  const hasSpeciesAssociations = collectAssociationIds(subjectConventions, 'species').length > 0

  return {
    species: SUBJECTS_WITH_SPECIES_FILTER.has(filters.subjectKind) && hasSpeciesAssociations,
    language:
      SUBJECTS_WITH_LANGUAGE_CULTURE_FILTER.has(filters.subjectKind) && hasLanguageAssociations,
    culture:
      SUBJECTS_WITH_LANGUAGE_CULTURE_FILTER.has(filters.subjectKind) && hasCultureAssociations,
    genderStyle: SUBJECTS_WITH_GENDER_FILTER.has(filters.subjectKind),
  }
}

export function deriveFilterOptions(
  filters: NameGeneratorFilters,
  conventions: readonly NamingConvention[],
): NameGeneratorFilterOptions {
  const speciesConventions = filterConventionsByPartialFilters(conventions, {
    subjectKind: filters.subjectKind,
    languageId: filters.languageId,
    cultureId: filters.cultureId,
  })
  const languageConventions = filterConventionsByPartialFilters(conventions, {
    subjectKind: filters.subjectKind,
    speciesId: filters.speciesId,
    cultureId: filters.cultureId,
  })
  const cultureConventions = filterConventionsByPartialFilters(conventions, {
    subjectKind: filters.subjectKind,
    speciesId: filters.speciesId,
    languageId: filters.languageId,
  })

  return {
    subjectKinds: buildSubjectOptions(conventions),
    speciesIds: buildSpeciesOptions(speciesConventions),
    languageIds: buildLanguageOptions(languageConventions),
    cultureIds: buildCultureOptions(cultureConventions, {
      subjectKind: filters.subjectKind,
      speciesId: filters.speciesId,
      languageId: filters.languageId,
    }),
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
