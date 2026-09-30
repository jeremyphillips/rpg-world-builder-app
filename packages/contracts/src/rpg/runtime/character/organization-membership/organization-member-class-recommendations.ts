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

export const ORGANIZATION_NPC_CLASS_RECOMMENDATION_SOURCES = [
  'user',
  'title',
  'organization',
  'template',
] as const

export type OrganizationNpcClassRecommendationSource =
  (typeof ORGANIZATION_NPC_CLASS_RECOMMENDATION_SOURCES)[number]

export type SourcedClassRecommendation = {
  id: string
  sources: OrganizationNpcClassRecommendationSource[]
}

function pushSourcedClassRecommendation(
  target: SourcedClassRecommendation[],
  classId: string,
  sources: readonly OrganizationNpcClassRecommendationSource[],
  seen: Set<string>,
): void {
  if (seen.has(classId)) return
  seen.add(classId)
  target.push({ id: classId, sources: [...sources] })
}

/**
 * Merges template slug seeds and organization class affinity ids into one deduped ordered list.
 * Ranking: both sources → template-only → organization-only. Eligibility follows playable classes.
 * Each id keeps the sources that contributed it.
 */
export function resolveOrganizationNpcClassRecommendationIds(input: {
  templateClassAffinitySlugs?: readonly string[]
  /** Provenance for the slug list. Title overrides and explicit user slugs replace the template list. */
  templateSource?: Exclude<OrganizationNpcClassRecommendationSource, 'organization'>
  organizationClassAffinityIds?: readonly string[]
  playableClasses: readonly CharacterClass[]
}): SourcedClassRecommendation[] {
  const templateSource = input.templateSource ?? 'template'
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
  const both: SourcedClassRecommendation[] = []
  const templateOnly: SourcedClassRecommendation[] = []
  const organizationOnly: SourcedClassRecommendation[] = []

  for (const classId of templateIds) {
    if (!organizationIdSet.has(classId)) continue
    pushSourcedClassRecommendation(both, classId, [templateSource, 'organization'], seen)
  }
  for (const classId of templateIds) {
    if (organizationIdSet.has(classId)) continue
    pushSourcedClassRecommendation(templateOnly, classId, [templateSource], seen)
  }
  for (const classId of organizationIds) {
    if (templateIdSet.has(classId)) continue
    pushSourcedClassRecommendation(organizationOnly, classId, ['organization'], seen)
  }

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
