import type { Species } from '../../../content/species'

import { intersectPersistedContentIds } from './intersect-persisted-content-ids'

/** Stored affinity ids intersected with playable species; order follows persisted affinities. */
export function resolveOrganizationMemberSpeciesRecommendationIds(input: {
  speciesAffinityIds: readonly string[]
  playableSpecies: readonly Species[]
}): string[] {
  return intersectPersistedContentIds(input.speciesAffinityIds, input.playableSpecies)
}

/** Stored affinity ids intersected with playable species; order follows persisted affinities. */
export function resolveOrganizationMemberSpeciesRecommendations(input: {
  speciesAffinityIds: readonly string[]
  playableSpecies: readonly Species[]
}): Species[] {
  const playableById = new Map(input.playableSpecies.map((species) => [species.id, species]))
  return resolveOrganizationMemberSpeciesRecommendationIds(input)
    .map((speciesId) => playableById.get(speciesId))
    .filter((species): species is Species => species !== undefined)
}

/** True when the character species id matches a surviving recommended affinity id. */
export function characterMatchesOrganizationMemberSpeciesRecommendations(input: {
  speciesId: string | undefined
  speciesAffinityIds: readonly string[]
  playableSpecies: readonly Species[]
}): boolean {
  if (input.speciesId === undefined || input.speciesId.length === 0) return false

  const recommendedIds = new Set(
    resolveOrganizationMemberSpeciesRecommendationIds({
      speciesAffinityIds: input.speciesAffinityIds,
      playableSpecies: input.playableSpecies,
    }),
  )
  return recommendedIds.has(input.speciesId)
}
