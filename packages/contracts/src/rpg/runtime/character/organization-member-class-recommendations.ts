import type { CharacterClass } from '../../content/classes/class'

function playableClassIds(playableClasses: readonly CharacterClass[]): Set<string> {
  return new Set(playableClasses.map((characterClass) => characterClass.id))
}

/** Stored affinity ids intersected with playable classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendationIds(input: {
  memberClassAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
}): string[] {
  const playableIds = playableClassIds(input.playableClasses)
  return input.memberClassAffinityIds.filter((classId) => playableIds.has(classId))
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
