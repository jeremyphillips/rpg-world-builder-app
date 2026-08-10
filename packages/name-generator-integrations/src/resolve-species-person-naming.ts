import type {
  HeritageCultureAlias,
  NamingContext,
  NamingConvention,
} from '@rpg/contracts/name-generator'
import { buildCultureContextFields } from '@rpg/name-generator-data'

import { buildNamingCultureContext } from './build-naming-culture-context'
import {
  buildSpeciesNamingOption,
  getPersonConventionIdsForSpecies,
  NO_PERSONAL_NAMING_CONVENTION_REASON,
  SPECIES_NAMING_UNSUPPORTED_REASON,
} from './build-species-naming-options'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'

export type SpeciesPersonNamingResolution =
  | {
      supported: true
      context: NamingContext
      conventionIds: readonly string[]
    }
  | {
      supported: false
      reason: string
    }

/**
 * Canonical species → person naming resolution for Quick NPC and other thin consumers.
 * Does not load collections or generate names.
 */
export function resolveSpeciesPersonNaming({
  species,
  conventions,
  heritageAliases = [],
}: {
  species: SpeciesCultureInput
  conventions: readonly NamingConvention[]
  heritageAliases?: readonly HeritageCultureAlias[]
}): SpeciesPersonNamingResolution {
  const option = buildSpeciesNamingOption(species, conventions, heritageAliases)
  if (option.disabled) {
    return {
      supported: false,
      reason: option.disabledReason ?? SPECIES_NAMING_UNSUPPORTED_REASON,
    }
  }

  const cultureId = option.cultureIds[0]
  if (cultureId === undefined) {
    return { supported: false, reason: NO_PERSONAL_NAMING_CONVENTION_REASON }
  }

  const conventionIds = getPersonConventionIdsForSpecies({
    conventions,
    species,
    heritageAliases,
  })

  if (conventionIds.length === 0) {
    return { supported: false, reason: NO_PERSONAL_NAMING_CONVENTION_REASON }
  }

  const cultureContext = buildNamingCultureContext(species)
  const cultureFields = buildCultureContextFields(cultureId)

  const context: NamingContext = {
    subjectKind: 'person',
    languageIds: [...cultureContext.languageIds],
    speciesIds: [species.id],
    ...cultureFields,
  }

  return {
    supported: true,
    context,
    conventionIds,
  }
}
