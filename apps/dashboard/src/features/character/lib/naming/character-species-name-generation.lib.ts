import {
  indexCharacterBuildCatalog,
  indexPlayableBuilderCatalog,
  type CharacterBuildContext,
} from '@rpg/contracts'
import {
  generateSpeciesPersonName as generateSpeciesPersonNameFromIntegrations,
  resolveSpeciesPersonNameGenerationSupport as resolveSpeciesPersonNameGenerationSupportFromIntegrations,
  toSpeciesCultureInput,
  type SpeciesPersonNameGenerationResult,
  type SpeciesPersonNameGenerationSupport,
} from '@rpg/name-generator-integrations'

import { SPECIES_NAME_GENERATION_FAILED } from './species-name-generation-labels'

export type { SpeciesPersonNameGenerationResult, SpeciesPersonNameGenerationSupport }
export { toSpeciesCultureInput }

/** Resolves whether name generation is available for a species in the builder catalog. */
export function resolveCharacterSpeciesNameGenerationSupport(args: {
  speciesId: string
  context: CharacterBuildContext
}): SpeciesPersonNameGenerationSupport {
  if (!args.speciesId) {
    return { enabled: false }
  }

  const playableSpecies = indexPlayableBuilderCatalog(args.context).species.get(args.speciesId)
  if (!playableSpecies) {
    return { enabled: false }
  }

  return resolveSpeciesPersonNameGenerationSupportFromIntegrations(
    toSpeciesCultureInput(playableSpecies),
  )
}

/** Generates a species-aware person name from builder catalog content. */
export async function generateCharacterSpeciesName(args: {
  speciesId: string
  context: CharacterBuildContext
}): Promise<SpeciesPersonNameGenerationResult> {
  const playableSpecies = indexPlayableBuilderCatalog(args.context).species.get(args.speciesId)
  if (!playableSpecies) {
    const catalogSpecies = indexCharacterBuildCatalog(args.context.catalog).species.get(
      args.speciesId,
    )
    if (!catalogSpecies) {
      return { ok: false, kind: 'unsupported', reason: SPECIES_NAME_GENERATION_FAILED }
    }

    return generateSpeciesPersonNameFromIntegrations(toSpeciesCultureInput(catalogSpecies))
  }

  return generateSpeciesPersonNameFromIntegrations(toSpeciesCultureInput(playableSpecies))
}
