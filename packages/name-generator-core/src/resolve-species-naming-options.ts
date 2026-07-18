import type {
  NamingConvention,
  NamingCulture,
  NameSubjectKind,
} from '@rpg/contracts/name-generator'
import type { SpeciesCultureConfig } from '@rpg/contracts/rpg/content'
import { getSpeciesCulturePrimaryId, isSpeciesNamingSupported } from '@rpg/contracts/rpg/content'

import { deriveAvailableSubjectKinds } from './derive-available-subject-kinds'

export const HOMEBREW_SPECIES_NAMING_DISABLED_REASON =
  'Name generation is not yet available for homebrew species.'

export const SPECIES_NAMING_UNSUPPORTED_REASON =
  'Name generation is not available for this species.'

export type SpeciesCultureInput = {
  id: string
  slug: string
  name: string
  source: 'system' | 'homebrew'
  culture?: SpeciesCultureConfig
  heritage?: {
    options: ReadonlyArray<{ id: string; name?: string }>
  }
}

export type NamingHeritageOption = {
  id: string
  label: string
}

export type SpeciesNamingOption = {
  speciesId: string
  label: string
  disabled: boolean
  disabledReason?: string
  cultureIds: string[]
  subjectKinds: NameSubjectKind[]
  heritageOptions?: NamingHeritageOption[]
}

export function getConventionCultureId(
  cultureId: string,
  cultures: readonly NamingCulture[],
): string {
  const culture = cultures.find((entry) => entry.id === cultureId)
  return culture?.resolvesToCultureId ?? cultureId
}

function conventionMatchesCulture(
  convention: NamingConvention,
  cultureId: string,
  cultures: readonly NamingCulture[],
): boolean {
  const conventionCultureId = getConventionCultureId(cultureId, cultures)
  return convention.associations.some(
    (association) =>
      association.kind === 'culture' && association.cultureId === conventionCultureId,
  )
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function deriveSpeciesNamingCultureIds({
  species,
  heritageOptionId,
  cultures,
}: {
  species: SpeciesCultureInput
  heritageOptionId?: string
  cultures: readonly NamingCulture[]
}): string[] {
  if (!isSpeciesNamingSupported(species)) {
    return []
  }

  if (heritageOptionId !== undefined) {
    const heritageMatches = cultures.filter(
      (culture) =>
        culture.heritageIds?.includes(heritageOptionId) && culture.speciesIds?.includes(species.id),
    )

    if (heritageMatches.length > 1) {
      throw new Error(
        `Multiple naming cultures match heritage ${heritageOptionId} for species ${species.id}`,
      )
    }

    if (heritageMatches.length === 1) {
      return [heritageMatches[0]!.id]
    }
  }

  const primaryId = getSpeciesCulturePrimaryId({ slug: species.slug, culture: species.culture })
  return [primaryId]
}

function getConventionIdsForCultures(
  conventions: readonly NamingConvention[],
  cultureIds: readonly string[],
  cultures: readonly NamingCulture[],
  subjectKind: NameSubjectKind = 'person',
): string[] {
  return conventions
    .filter((convention) => convention.subjectKinds.includes(subjectKind))
    .filter((convention) =>
      cultureIds.some((cultureId) => conventionMatchesCulture(convention, cultureId, cultures)),
    )
    .map((convention) => convention.id)
    .sort((left, right) => left.localeCompare(right))
}

function hasPersonalConvention(
  conventions: readonly NamingConvention[],
  cultureIds: readonly string[],
  cultures: readonly NamingCulture[],
): boolean {
  return getConventionIdsForCultures(conventions, cultureIds, cultures, 'person').length > 0
}

export function getNamingRelevantHeritages({
  species,
  cultures,
  conventions,
}: {
  species: SpeciesCultureInput
  cultures: readonly NamingCulture[]
  conventions: readonly NamingConvention[]
}): NamingHeritageOption[] {
  const heritageOptions = species.heritage?.options
  if (heritageOptions === undefined || heritageOptions.length === 0) {
    return []
  }

  const baseCultureIds = deriveSpeciesNamingCultureIds({ species, cultures })
  const baseConventionIds = getConventionIdsForCultures(conventions, baseCultureIds, cultures)

  const relevant: NamingHeritageOption[] = []
  for (const option of heritageOptions) {
    const heritageCultureIds = deriveSpeciesNamingCultureIds({
      species,
      heritageOptionId: option.id,
      cultures,
    })
    const heritageConventionIds = getConventionIdsForCultures(
      conventions,
      heritageCultureIds,
      cultures,
    )

    if (
      !arraysEqual(baseCultureIds, heritageCultureIds) ||
      !arraysEqual(baseConventionIds, heritageConventionIds)
    ) {
      relevant.push({
        id: option.id,
        label: option.name ?? option.id,
      })
    }
  }

  return relevant
}

function resolveEnabledSpeciesNamingOption(
  species: SpeciesCultureInput,
  cultures: readonly NamingCulture[],
  conventions: readonly NamingConvention[],
): SpeciesNamingOption | undefined {
  const cultureIds = deriveSpeciesNamingCultureIds({ species, cultures })
  if (!hasPersonalConvention(conventions, cultureIds, cultures)) {
    return undefined
  }

  const heritageOptions = getNamingRelevantHeritages({ species, cultures, conventions })
  const subjectKinds = deriveAvailableSubjectKinds({ cultureIds, conventions })

  return {
    speciesId: species.id,
    label: species.name,
    disabled: false,
    cultureIds,
    subjectKinds,
    ...(heritageOptions.length > 0 ? { heritageOptions } : {}),
  }
}

export function resolveSpeciesNamingOption(
  species: SpeciesCultureInput,
  cultures: readonly NamingCulture[],
  conventions: readonly NamingConvention[],
): SpeciesNamingOption | undefined {
  if (species.source === 'homebrew') {
    return {
      speciesId: species.id,
      label: species.name,
      disabled: true,
      disabledReason: HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
      cultureIds: [],
      subjectKinds: [],
    }
  }

  if (!isSpeciesNamingSupported(species)) {
    return {
      speciesId: species.id,
      label: species.name,
      disabled: true,
      disabledReason: SPECIES_NAMING_UNSUPPORTED_REASON,
      cultureIds: [],
      subjectKinds: [],
    }
  }

  return resolveEnabledSpeciesNamingOption(species, cultures, conventions)
}

export function resolveSpeciesNamingOptions({
  speciesList,
  cultures,
  conventions,
}: {
  speciesList: readonly SpeciesCultureInput[]
  cultures: readonly NamingCulture[]
  conventions: readonly NamingConvention[]
}): SpeciesNamingOption[] {
  const options: SpeciesNamingOption[] = []

  for (const species of speciesList) {
    const option = resolveSpeciesNamingOption(species, cultures, conventions)
    if (option !== undefined) {
      options.push(option)
    }
  }

  return options
}
