import type {
  HeritageCultureAlias,
  NamingConvention,
  NamingConventionDefinition,
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

function resolveTargetCultureId(species: SpeciesCultureInput): string {
  return buildNamingCultureContext(species).cultureId
}

function resolveDefinitionsForSpecies({
  species,
  bindings,
}: {
  species: SpeciesCultureInput
  bindings: Readonly<Record<string, readonly NamingConventionDefinition[]>>
}): NamingConvention[] {
  const cultureId = resolveTargetCultureId(species)
  const definitions = bindings[cultureId]

  if (definitions === undefined) {
    return []
  }

  const context = buildNamingCultureContext(species)

  return definitions.map((definition) => resolveNamingConvention({ context, definition }))
}

export function resolveCampaignConventions({
  species,
  bindings,
  heritageAliases: _heritageAliases = [],
}: {
  species: readonly SpeciesCultureInput[]
  bindings: Readonly<Record<string, readonly NamingConventionDefinition[]>>
  heritageAliases?: readonly HeritageCultureAlias[]
}): NamingConvention[] {
  const conventions: NamingConvention[] = []
  const seenIds = new Set<string>()
  const processedCultureIds = new Set<string>()

  for (const entry of species) {
    if (entry.source === 'homebrew' || !isSpeciesNamingSupported(entry)) {
      continue
    }

    const cultureId = resolveTargetCultureId(entry)
    if (processedCultureIds.has(cultureId)) {
      continue
    }

    processedCultureIds.add(cultureId)

    for (const convention of resolveDefinitionsForSpecies({
      species: entry,
      bindings,
    })) {
      if (seenIds.has(convention.id)) {
        continue
      }

      seenIds.add(convention.id)
      conventions.push(convention)
    }
  }

  return conventions
}
