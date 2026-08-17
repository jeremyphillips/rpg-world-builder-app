import type { CharacterClass } from '../../content/classes/class'

function availableClassIds(availableClasses: readonly CharacterClass[]): Set<string> {
  return new Set(availableClasses.map((characterClass) => characterClass.id))
}

/** Stored affinity ids intersected with available classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendationIds(input: {
  memberClassAffinityIds: readonly string[]
  availableClasses: readonly CharacterClass[]
}): string[] {
  const availableIds = availableClassIds(input.availableClasses)
  return input.memberClassAffinityIds.filter((classId) => availableIds.has(classId))
}

/** Stored affinity ids intersected with available classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendations(input: {
  memberClassAffinityIds: readonly string[]
  availableClasses: readonly CharacterClass[]
}): CharacterClass[] {
  const availableById = new Map(
    input.availableClasses.map((characterClass) => [characterClass.id, characterClass]),
  )
  return resolveOrganizationMemberClassRecommendationIds(input)
    .map((classId) => availableById.get(classId))
    .filter((characterClass): characterClass is CharacterClass => characterClass !== undefined)
}

/** True when any character class id matches a surviving recommended affinity id. */
export function characterMatchesOrganizationMemberClassRecommendations(input: {
  classIds: readonly string[]
  memberClassAffinityIds: readonly string[]
  availableClasses: readonly CharacterClass[]
}): boolean {
  const recommendedIds = new Set(
    resolveOrganizationMemberClassRecommendationIds({
      memberClassAffinityIds: input.memberClassAffinityIds,
      availableClasses: input.availableClasses,
    }),
  )
  return input.classIds.some((classId) => recommendedIds.has(classId))
}
