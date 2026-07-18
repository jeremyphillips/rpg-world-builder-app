import type { Species } from '@rpg/contracts'
import type { NamingConvention } from '@rpg/contracts/name-generator'
import { getSpeciesCultureDisplayName } from '@rpg/contracts/rpg/content'
import {
  CULTURE_CONVENTION_BINDINGS,
  HERITAGE_CULTURE_ALIASES,
  listStaticConventions,
  STANDALONE_NAMING_CULTURES,
} from '@rpg/name-generator-data'
import {
  buildNamingCultureContext,
  buildSpeciesNamingOptions,
  resolveCampaignConventions,
  resolveStandaloneConventions,
  type SpeciesCultureInput,
  type SpeciesNamingOption,
} from '@rpg/name-generator-integrations'

export type { SpeciesCultureInput } from '@rpg/name-generator-integrations'

export function toSpeciesCultureInput(species: Species): SpeciesCultureInput {
  return {
    id: species.id,
    slug: species.slug,
    name: species.name,
    source: species.source,
    languageAffinities: species.languageAffinities,
    culture: species.culture,
    heritage:
      species.heritage === undefined
        ? undefined
        : {
            options: species.heritage.options.map((option) => ({
              id: option.id,
              name: 'name' in option ? option.name : undefined,
            })),
          },
  }
}

export type ComposedNameGeneratorConventions = {
  conventions: readonly NamingConvention[]
  speciesNamingOptions: SpeciesNamingOption[]
  getConvention: (conventionId: string) => NamingConvention | undefined
}

export function composeNameGeneratorConventions(
  species: readonly SpeciesCultureInput[],
): ComposedNameGeneratorConventions {
  const staticConventions = listStaticConventions()
  const campaignConventions = resolveCampaignConventions({
    species,
    bindings: CULTURE_CONVENTION_BINDINGS,
    heritageAliases: HERITAGE_CULTURE_ALIASES,
  })
  const standaloneConventions = resolveStandaloneConventions({
    cultures: STANDALONE_NAMING_CULTURES,
    bindings: CULTURE_CONVENTION_BINDINGS,
  })
  const conventions = [...campaignConventions, ...standaloneConventions, ...staticConventions]
  const conventionById = new Map(conventions.map((convention) => [convention.id, convention]))
  const speciesNamingOptions = buildSpeciesNamingOptions({
    species,
    resolvedConventions: conventions,
    heritageAliases: HERITAGE_CULTURE_ALIASES,
  })

  return {
    conventions,
    speciesNamingOptions,
    getConvention: (conventionId: string) => conventionById.get(conventionId),
  }
}

export type NamingCultureFilterContext = {
  id: string
  label: string
  languageIds: readonly string[]
}

function getStandaloneCultureLanguageIds(
  culture: (typeof STANDALONE_NAMING_CULTURES)[number],
): readonly string[] {
  if (!('languageIds' in culture) || !Array.isArray(culture.languageIds)) {
    return []
  }

  return culture.languageIds
}

export function buildCultureFilterContexts(
  species: readonly SpeciesCultureInput[],
): NamingCultureFilterContext[] {
  const contexts = new Map<string, NamingCultureFilterContext>()

  for (const culture of STANDALONE_NAMING_CULTURES) {
    contexts.set(culture.id, {
      id: culture.id,
      label: culture.label,
      languageIds: getStandaloneCultureLanguageIds(culture),
    })
  }

  for (const entry of species) {
    const context = buildNamingCultureContext(entry)
    contexts.set(context.cultureId, {
      id: context.cultureId,
      label: context.cultureLabel,
      languageIds: context.languageIds,
    })
  }

  for (const convention of listStaticConventions()) {
    for (const association of convention.associations) {
      if (association.kind !== 'culture' || contexts.has(association.cultureId)) {
        continue
      }

      const languageIds = convention.associations
        .filter((entry) => entry.kind === 'language')
        .map((entry) => (entry.kind === 'language' ? entry.languageId : ''))
        .filter((languageId) => languageId !== '')

      contexts.set(association.cultureId, {
        id: association.cultureId,
        label: getSpeciesCultureDisplayName({ slug: association.cultureId }),
        languageIds,
      })
    }
  }

  return [...contexts.values()].sort((left, right) => left.label.localeCompare(right.label))
}
