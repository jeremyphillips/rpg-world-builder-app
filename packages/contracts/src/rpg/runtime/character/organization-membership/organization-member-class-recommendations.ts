import type { CharacterClass } from '../../../content/classes/class'

import { intersectPersistedContentIds } from './intersect-persisted-content-ids'

function resolveClassAffinitySlugsToIds(
  slugs: readonly string[],
  playableClasses: readonly CharacterClass[],
): string[] {
  const availableBySlug = new Map(
    playableClasses.map((characterClass) => [characterClass.slug, characterClass.id]),
  )
  const ids: string[] = []

  for (const slug of slugs) {
    const classId = availableBySlug.get(slug)
    if (classId) ids.push(classId)
  }

  return ids
}

/** Stored affinity ids intersected with playable classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendationIds(input: {
  classAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
}): string[] {
  return intersectPersistedContentIds(input.classAffinityIds, input.playableClasses)
}

function appendUniqueClassIds(
  target: string[],
  source: readonly string[],
  seen: Set<string>,
  shouldInclude: (classId: string) => boolean,
): void {
  for (const classId of source) {
    if (!shouldInclude(classId) || seen.has(classId)) continue
    target.push(classId)
    seen.add(classId)
  }
}

/**
 * Merges template slug seeds and organization class affinity ids into one deduped ordered list.
 * Ranking: both sources → template-only → organization-only. Eligibility follows playable classes.
 */
export function resolveOrganizationNpcClassRecommendationIds(input: {
  templateClassAffinitySlugs?: readonly string[]
  organizationClassAffinityIds?: readonly string[]
  playableClasses: readonly CharacterClass[]
}): string[] {
  const templateIds = resolveClassAffinitySlugsToIds(
    input.templateClassAffinitySlugs ?? [],
    input.playableClasses,
  )
  const organizationIds = intersectPersistedContentIds(
    input.organizationClassAffinityIds ?? [],
    input.playableClasses,
  )

  const templateIdSet = new Set(templateIds)
  const organizationIdSet = new Set(organizationIds)
  const seen = new Set<string>()
  const both: string[] = []
  const templateOnly: string[] = []
  const organizationOnly: string[] = []

  appendUniqueClassIds(both, templateIds, seen, (classId) => organizationIdSet.has(classId))
  appendUniqueClassIds(
    templateOnly,
    templateIds,
    seen,
    (classId) => !organizationIdSet.has(classId),
  )
  appendUniqueClassIds(
    organizationOnly,
    organizationIds,
    seen,
    (classId) => !templateIdSet.has(classId),
  )

  return [...both, ...templateOnly, ...organizationOnly]
}

/** Stored affinity ids intersected with playable classes; order follows persisted affinities. */
export function resolveOrganizationMemberClassRecommendations(input: {
  classAffinityIds: readonly string[]
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
  classAffinityIds: readonly string[]
  playableClasses: readonly CharacterClass[]
}): boolean {
  const recommendedIds = new Set(
    resolveOrganizationMemberClassRecommendationIds({
      classAffinityIds: input.classAffinityIds,
      playableClasses: input.playableClasses,
    }),
  )
  return input.classIds.some((classId) => recommendedIds.has(classId))
}
