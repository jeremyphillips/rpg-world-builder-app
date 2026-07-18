import type {
  HeritageCultureAlias,
  NamingConvention,
  NameSubjectKind,
} from '@rpg/contracts/name-generator'
import { isSpeciesNamingSupported } from '@rpg/contracts/rpg/content'
import { deriveAvailableSubjectKinds } from '@rpg/name-generator-core'

import { buildNamingCultureContext } from './build-naming-culture-context'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'

export const HOMEBREW_SPECIES_NAMING_DISABLED_REASON =
  'Name generation is not yet available for homebrew species.'

export const SPECIES_NAMING_UNSUPPORTED_REASON =
  'Name generation is not available for this species.'

export const NO_PERSONAL_NAMING_CONVENTION_REASON =
  'No personal naming convention is available for this culture.'

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

function resolveHeritageTargetCultureId({
  speciesId,
  heritageId,
  heritageAliases,
}: {
  speciesId: string
  heritageId: string
  heritageAliases: readonly HeritageCultureAlias[]
}): string | undefined {
  return heritageAliases.find(
    (alias) => alias.speciesId === speciesId && alias.heritageId === heritageId,
  )?.targetCultureId
}

export function deriveSpeciesNamingCultureIds({
  species,
  heritageOptionId,
  heritageAliases = [],
}: {
  species: SpeciesCultureInput
  heritageOptionId?: string
  heritageAliases?: readonly HeritageCultureAlias[]
}): string[] {
  if (!isSpeciesNamingSupported(species)) {
    return []
  }

  if (heritageOptionId !== undefined) {
    const targetCultureId = resolveHeritageTargetCultureId({
      speciesId: species.id,
      heritageId: heritageOptionId,
      heritageAliases,
    })

    if (targetCultureId !== undefined) {
      return [targetCultureId]
    }
  }

  const { cultureId } = buildNamingCultureContext(species)
  return [cultureId]
}

function conventionMatchesCulture(
  convention: NamingConvention,
  cultureId: string,
  heritageAliases: readonly HeritageCultureAlias[],
  speciesId: string,
): boolean {
  const targetCultureIds = new Set<string>([cultureId])

  for (const alias of heritageAliases) {
    if (alias.speciesId === speciesId && alias.targetCultureId === cultureId) {
      targetCultureIds.add(alias.heritageId)
    }
    if (alias.speciesId === speciesId && alias.heritageId === cultureId) {
      targetCultureIds.add(alias.targetCultureId)
    }
  }

  return convention.associations.some(
    (association) => association.kind === 'culture' && targetCultureIds.has(association.cultureId),
  )
}

function getConventionIdsForCultures(
  conventions: readonly NamingConvention[],
  cultureIds: readonly string[],
  heritageAliases: readonly HeritageCultureAlias[],
  speciesId: string,
  subjectKind: NameSubjectKind = 'person',
): string[] {
  return conventions
    .filter((convention) => convention.subjectKinds.includes(subjectKind))
    .filter((convention) =>
      cultureIds.some((cultureId) =>
        conventionMatchesCulture(convention, cultureId, heritageAliases, speciesId),
      ),
    )
    .map((convention) => convention.id)
    .sort((left, right) => left.localeCompare(right))
}

function hasPersonalConvention(
  conventions: readonly NamingConvention[],
  cultureIds: readonly string[],
  heritageAliases: readonly HeritageCultureAlias[],
  speciesId: string,
): boolean {
  return (
    getConventionIdsForCultures(conventions, cultureIds, heritageAliases, speciesId, 'person')
      .length > 0
  )
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function getNamingRelevantHeritages({
  species,
  conventions,
  heritageAliases = [],
}: {
  species: SpeciesCultureInput
  conventions: readonly NamingConvention[]
  heritageAliases?: readonly HeritageCultureAlias[]
}): NamingHeritageOption[] {
  const heritageOptions = species.heritage?.options
  if (heritageOptions === undefined || heritageOptions.length === 0) {
    return []
  }

  const baseCultureIds = deriveSpeciesNamingCultureIds({ species, heritageAliases })
  const baseConventionIds = getConventionIdsForCultures(
    conventions,
    baseCultureIds,
    heritageAliases,
    species.id,
  )

  const relevant: NamingHeritageOption[] = []
  for (const option of heritageOptions) {
    const heritageCultureIds = deriveSpeciesNamingCultureIds({
      species,
      heritageOptionId: option.id,
      heritageAliases,
    })
    const heritageConventionIds = getConventionIdsForCultures(
      conventions,
      heritageCultureIds,
      heritageAliases,
      species.id,
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
  conventions: readonly NamingConvention[],
  heritageAliases: readonly HeritageCultureAlias[],
): SpeciesNamingOption | undefined {
  const cultureIds = deriveSpeciesNamingCultureIds({ species, heritageAliases })
  if (!hasPersonalConvention(conventions, cultureIds, heritageAliases, species.id)) {
    return {
      speciesId: species.id,
      label: species.name,
      disabled: true,
      disabledReason: NO_PERSONAL_NAMING_CONVENTION_REASON,
      cultureIds,
      subjectKinds: [],
    }
  }

  const heritageOptions = getNamingRelevantHeritages({ species, conventions, heritageAliases })
  const subjectKinds = deriveAvailableSubjectKinds({
    cultureIds,
    conventions,
    resolveConventionCultureId: (cultureId) => {
      const alias = heritageAliases.find(
        (entry) => entry.speciesId === species.id && entry.heritageId === cultureId,
      )
      return alias?.targetCultureId ?? cultureId
    },
  })

  return {
    speciesId: species.id,
    label: species.name,
    disabled: false,
    cultureIds,
    subjectKinds,
    ...(heritageOptions.length > 0 ? { heritageOptions } : {}),
  }
}

export function buildSpeciesNamingOption(
  species: SpeciesCultureInput,
  conventions: readonly NamingConvention[],
  heritageAliases: readonly HeritageCultureAlias[] = [],
): SpeciesNamingOption {
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

  return (
    resolveEnabledSpeciesNamingOption(species, conventions, heritageAliases) ?? {
      speciesId: species.id,
      label: species.name,
      disabled: true,
      disabledReason: NO_PERSONAL_NAMING_CONVENTION_REASON,
      cultureIds: deriveSpeciesNamingCultureIds({ species, heritageAliases }),
      subjectKinds: [],
    }
  )
}

export function buildSpeciesNamingOptions({
  species,
  resolvedConventions,
  heritageAliases = [],
}: {
  species: readonly SpeciesCultureInput[]
  resolvedConventions: readonly NamingConvention[]
  heritageAliases?: readonly HeritageCultureAlias[]
}): SpeciesNamingOption[] {
  return species.map((entry) =>
    buildSpeciesNamingOption(entry, resolvedConventions, heritageAliases),
  )
}
