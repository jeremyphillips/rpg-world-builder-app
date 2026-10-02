/**
 * Where a recommendation signal is allowed to apply.
 * Class-owned signals require the selected class. Global signals only rank
 * candidates that are already legal for that class.
 */
export type RecommendationScope = { kind: 'global' } | { kind: 'class'; classId: string }

export const GLOBAL_RECOMMENDATION_SCOPE: RecommendationScope = { kind: 'global' }

export function classRecommendationScope(classId: string): RecommendationScope {
  return { kind: 'class', classId }
}

/**
 * Class scope applies only for the matching selected class.
 * Missing scope and global scope stay applicable. Omitting `selectedClassId`
 * skips the class check so callers that are not enforcing a class still record
 * the signal.
 */
export function recommendationScopeApplies(
  scope: RecommendationScope | undefined,
  selectedClassId: string | undefined,
): boolean {
  if (scope === undefined || scope.kind === 'global') return true
  if (selectedClassId === undefined) return true
  return scope.classId === selectedClassId
}

export function recommendationScopeIdentity(scope: RecommendationScope | undefined): string {
  if (!scope) return ''
  if (scope.kind === 'global') return 'global'
  return `class:${scope.classId}`
}
