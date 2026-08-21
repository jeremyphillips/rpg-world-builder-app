/**
 * Explicit mutation boundaries for cross-content relationship drawers.
 * The action that opens the drawer determines which endpoints are mutable.
 */
export type RelationshipMutationMode =
  | 'add'
  | 'changeKind'
  | 'changeTarget'
  | 'replaceSubject'
  | 'remove'
