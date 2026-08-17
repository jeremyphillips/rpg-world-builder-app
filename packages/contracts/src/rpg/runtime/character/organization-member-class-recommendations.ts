import type { CharacterClass } from '../../content/classes/class'

import { intersectPersistedContentIds } from './intersect-persisted-content-ids'

/** Stored affinity ids intersected with playable classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendationIds(input: {
  memberClassAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
}): string[] {
  return intersectPersistedContentIds(input.memberClassAffinityIds, input.playableClasses)
}

/** Stored affinity ids intersected with playable classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendations(input: {
  memberClassAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
}): CharacterClass[] {
  const playableById = new Map(
    input.playableClasses.map((characterClass) => [characterClass.id, characterClass]),
  )
  return resolveOrganizationMemberClassRecommendationIds(input)
    .map((classId) => playableById.get(classId))
    .filter((characterClass): characterClass is CharacterClass => characterClass !== undefined)
}

/** True when any character class id matches a surviving recommended affinity id. */
export function characterMatchesOrganizationMemberClassRecommendations(input: {
  classIds: readonly string[]
  memberClassAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
}): boolean {
  const recommendedIds = new Set(
    resolveOrganizationMemberClassRecommendationIds({
      memberClassAffinityIds: input.memberClassAffinityIds,
      playableClasses: input.playableClasses,
    }),
  )
  return input.classIds.some((classId) => recommendedIds.has(classId))
}
