import type { RelationshipOperationState } from '../core/relationship-mutation-capabilities'

export type RelationshipCandidateSet<T> = {
  readonly items: readonly T[]
  /**
   * True only when `items` represents the entire relevant domain candidate set.
   * NOT equivalent to "query finished loading" — a succeeded paginated page is still false.
   * Never set true for search results, picker pages, table slices, or rendered-row subsets.
   */
  readonly isAuthoritativeDomainSet: boolean
}

export const EMPTY_RELATIONSHIP_CANDIDATE_SET: RelationshipCandidateSet<never> = {
  items: [],
  isAuthoritativeDomainSet: false,
}

export function resolveRelationshipCandidateSet<T>(
  candidateSet?: RelationshipCandidateSet<T>,
): RelationshipCandidateSet<T> {
  return candidateSet ?? EMPTY_RELATIONSHIP_CANDIDATE_SET
}

export function resolveCatalogMutationAvailability(input: {
  supported: boolean
  matchCount: number
  isAuthoritativeDomainSet: boolean
  /** Transient prerequisite still loading (e.g. occupancy edges). Takes precedence over count. */
  prerequisiteUnknown?: boolean
}): RelationshipOperationState {
  if (!input.supported) {
    return { supported: false, availability: 'unavailable' }
  }

  if (input.prerequisiteUnknown) {
    return { supported: true, availability: 'unknown', isResolving: true }
  }

  if (input.matchCount > 0) {
    return { supported: true, availability: 'available' }
  }

  if (input.isAuthoritativeDomainSet) {
    return { supported: true, availability: 'unavailable' }
  }

  return { supported: true, availability: 'unknown' }
}

/** Domain-structural availability (kind registry, fixed-endpoint rows) — not catalog scans. */
export function availabilityFromStructuralCount(
  supported: boolean,
  count: number,
  prerequisiteUnknown: boolean,
): RelationshipOperationState {
  if (!supported) {
    return { supported: false, availability: 'unavailable' }
  }

  if (prerequisiteUnknown) {
    return { supported: true, availability: 'unknown', isResolving: true }
  }

  return {
    supported: true,
    availability: count > 0 ? 'available' : 'unavailable',
  }
}
