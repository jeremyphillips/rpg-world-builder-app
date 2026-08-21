export type AvailabilityState = 'available' | 'unavailable' | 'unknown'

export type RelationshipOperationState = {
  /** Mutation category applies on this surface (authz + endpoint mutability). */
  supported: boolean
  /** Whether >= 1 valid alternative exists. `unknown` while prerequisite data is loading. */
  availability: AvailabilityState
  /** Transient authoritative data still loading. Only meaningful when availability === 'unknown'. */
  isResolving?: boolean
}

export type RelationshipMutationCapabilities = {
  view?: RelationshipOperationState
  changeKind?: RelationshipOperationState
  changeTarget?: RelationshipOperationState
  replaceSubject?: RelationshipOperationState
  remove?: RelationshipOperationState
}
