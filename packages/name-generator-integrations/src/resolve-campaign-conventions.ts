import type {
  HeritageNamingCulture,
  NamingConvention,
  NamingConventionDefinition,
  NamingCultureContext,
} from '@rpg/contracts/name-generator'
import { isSpeciesNamingSupported } from '@rpg/contracts/rpg/content'
import type { SpeciesCultureConfig } from '@rpg/contracts/rpg/content'

import { buildNamingCultureContext } from './build-naming-culture-context'
import { resolveNamingConvention } from './resolve-naming-convention'

export type SpeciesCultureInput = {
  id: string
  slug: string
  name: string
  source: 'system' | 'homebrew'
  culture?: SpeciesCultureConfig
  languageAffinities?: readonly string[]
  heritage?: {
    options: ReadonlyArray<{ id: string; name?: string }>
  }
}

/**
 * Naming culture contexts a species contributes: its own culture, plus one per
 * heritage naming culture whose heritage options the species actually offers.
 */
export function resolveSpeciesCultureContexts({
  species,
  heritageCultures = [],
}: {
  species: SpeciesCultureInput
  heritageCultures?: readonly HeritageNamingCulture[]
}): NamingCultureContext[] {
  const baseContext = buildNamingCultureContext(species)
  const heritageOptionIds = new Set((species.heritage?.options ?? []).map((option) => option.id))

  const heritageContexts = heritageCultures
    .filter(
      (culture) =>
        culture.speciesSlug === species.slug &&
        culture.heritageIds.some((heritageId) => heritageOptionIds.has(heritageId)),
    )
    .map((culture) => ({
      cultureId: culture.id,
      cultureLabel: culture.label,
      languageIds: culture.languageIds ?? baseContext.languageIds,
    }))

  return [baseContext, ...heritageContexts]
}

export function resolveCampaignConventions({
  species,
  bindings,
  heritageCultures = [],
}: {
  species: readonly SpeciesCultureInput[]
  bindings: Readonly<Record<string, readonly NamingConventionDefinition[]>>
  heritageCultures?: readonly HeritageNamingCulture[]
}): NamingConvention[] {
  const conventions: NamingConvention[] = []
  const seenIds = new Set<string>()
  const processedCultureIds = new Set<string>()

  for (const entry of species) {
    if (entry.source === 'homebrew' || !isSpeciesNamingSupported(entry)) {
      continue
    }

    for (const context of resolveSpeciesCultureContexts({ species: entry, heritageCultures })) {
      if (processedCultureIds.has(context.cultureId)) {
        continue
      }

      processedCultureIds.add(context.cultureId)

      for (const definition of bindings[context.cultureId] ?? []) {
        const convention = resolveNamingConvention({ context, definition })
        if (seenIds.has(convention.id)) {
          continue
        }

        seenIds.add(convention.id)
        conventions.push(convention)
      }
    }
  }

  return conventions
}
