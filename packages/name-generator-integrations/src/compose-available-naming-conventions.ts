import type { NamingConvention } from '@rpg/contracts/name-generator'
import {
  CULTURE_CONVENTION_BINDINGS,
  HERITAGE_NAMING_CULTURES,
  listStaticConventions,
  STANDALONE_NAMING_CULTURES,
} from '@rpg/name-generator-data'

import {
  resolveCampaignConventions,
  type SpeciesCultureInput,
} from './resolve-campaign-conventions'
import { resolveStandaloneConventions } from './resolve-standalone-conventions'

export type ComposedAvailableNamingConventions = {
  conventions: readonly NamingConvention[]
  getConvention: (conventionId: string) => NamingConvention | undefined
}

/** Campaign + standalone + static conventions available for species-aware generation. */
export function composeAvailableNamingConventions(
  species: readonly SpeciesCultureInput[],
): ComposedAvailableNamingConventions {
  const campaignConventions = resolveCampaignConventions({
    species,
    bindings: CULTURE_CONVENTION_BINDINGS,
    heritageCultures: HERITAGE_NAMING_CULTURES,
  })
  const standaloneConventions = resolveStandaloneConventions({
    cultures: STANDALONE_NAMING_CULTURES,
    bindings: CULTURE_CONVENTION_BINDINGS,
  })
  const conventions = [...campaignConventions, ...standaloneConventions, ...listStaticConventions()]
  const conventionById = new Map(conventions.map((convention) => [convention.id, convention]))

  return {
    conventions,
    getConvention: (conventionId: string) => conventionById.get(conventionId),
  }
}
