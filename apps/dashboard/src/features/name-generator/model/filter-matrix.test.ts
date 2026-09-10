import { describe, expect, it } from 'vitest'

import { loadSeedSpecies } from '@rpg/catalog/species'

import { buildNamingContext } from './build-naming-context'
import {
  buildCultureFilterContexts,
  composeNameGeneratorConventions,
  toSpeciesCultureInput,
} from './compose-name-generator-conventions'
import {
  deriveFilterOptions,
  deriveVisibleFilters,
  type NameGeneratorFilterContext,
} from './derive-filter-options'
import type { FilterOption, NameGeneratorFilters } from './name-generator-filters'
import { DEFAULT_RULESET_ID } from './name-generator.constants'
import { recommendNameGeneratorMatches } from './recommend-name-generator-matches'

const SRD_SPECIES = loadSeedSpecies(DEFAULT_RULESET_ID)

function withOptional(
  filters: NameGeneratorFilters,
  key: keyof NameGeneratorFilters,
  option: FilterOption | undefined,
): NameGeneratorFilters {
  if (option === undefined) {
    return filters
  }

  return { ...filters, [key]: option.id }
}

function optionalChoices(options: readonly FilterOption[]): Array<FilterOption | undefined> {
  return [undefined, ...options]
}

describe('name generator filter matrix', () => {
  const speciesInputs = SRD_SPECIES.map(toSpeciesCultureInput)
  const { conventions, speciesNamingOptions } = composeNameGeneratorConventions(speciesInputs)
  const filterContext: NameGeneratorFilterContext = {
    speciesNamingOptions,
    cultures: buildCultureFilterContexts(speciesInputs),
  }

  it('offers only filter combinations that match at least one convention', () => {
    const rootOptions = deriveFilterOptions({ subjectKind: 'person' }, conventions, filterContext)

    let combinations = 0

    for (const subject of rootOptions.subjectKinds) {
      const subjectFilters = { subjectKind: subject.id } as NameGeneratorFilters
      const subjectVisible = deriveVisibleFilters(subjectFilters, conventions, filterContext)
      const subjectOptions = deriveFilterOptions(subjectFilters, conventions, filterContext)

      const speciesChoices = subjectVisible.species
        ? optionalChoices(subjectOptions.speciesIds)
        : [undefined]

      for (const species of speciesChoices) {
        const speciesFilters = withOptional(subjectFilters, 'speciesId', species)
        const speciesVisible = deriveVisibleFilters(speciesFilters, conventions, filterContext)
        const speciesOptions = deriveFilterOptions(speciesFilters, conventions, filterContext)

        const heritageChoices = speciesVisible.heritage
          ? optionalChoices(speciesOptions.heritageIds)
          : [undefined]

        for (const heritage of heritageChoices) {
          const heritageFilters = withOptional(speciesFilters, 'heritageId', heritage)
          const heritageVisible = deriveVisibleFilters(heritageFilters, conventions, filterContext)
          const heritageOptions = deriveFilterOptions(heritageFilters, conventions, filterContext)

          const languageChoices = heritageVisible.language
            ? optionalChoices(heritageOptions.languageIds)
            : [undefined]

          for (const language of languageChoices) {
            const languageFilters = withOptional(heritageFilters, 'languageId', language)
            const languageVisible = deriveVisibleFilters(
              languageFilters,
              conventions,
              filterContext,
            )
            const languageOptions = deriveFilterOptions(languageFilters, conventions, filterContext)

            const cultureChoices = languageVisible.culture
              ? optionalChoices(languageOptions.cultureIds)
              : [undefined]

            for (const culture of cultureChoices) {
              const cultureFilters = withOptional(languageFilters, 'cultureId', culture)
              const cultureVisible = deriveVisibleFilters(
                cultureFilters,
                conventions,
                filterContext,
              )
              const cultureOptions = deriveFilterOptions(cultureFilters, conventions, filterContext)

              const regionChoices = cultureVisible.region
                ? optionalChoices(cultureOptions.regionIds)
                : [undefined]

              for (const region of regionChoices) {
                const filters = withOptional(cultureFilters, 'regionId', region)
                const matches = recommendNameGeneratorMatches(
                  buildNamingContext(filters),
                  conventions,
                  filters,
                )

                combinations += 1
                expect(matches.length, `no matches for ${JSON.stringify(filters)}`).toBeGreaterThan(
                  0,
                )
              }
            }
          }
        }
      }
    }

    expect(combinations).toBeGreaterThan(0)
  })
})
