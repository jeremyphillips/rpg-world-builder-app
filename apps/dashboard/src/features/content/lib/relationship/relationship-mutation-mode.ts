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

export type OrganizationForwardDrawerMode = 'add' | 'changeKind' | 'changeTarget'

export type OrganizationInverseDrawerMode = 'add' | 'changeKind' | 'replaceOrganization'

export function isRelationshipKindMutationMode(
  mode: RelationshipMutationMode | OrganizationInverseDrawerMode | OrganizationForwardDrawerMode,
): mode is 'changeKind' {
  return mode === 'changeKind'
}

export function isRelationshipTargetMutationMode(
  mode: RelationshipMutationMode | OrganizationForwardDrawerMode,
): mode is 'changeTarget' {
  return mode === 'changeTarget'
}

export function isRelationshipSubjectMutationMode(
  mode: RelationshipMutationMode | OrganizationInverseDrawerMode,
): mode is 'replaceSubject' | 'replaceOrganization' {
  return mode === 'replaceSubject' || mode === 'replaceOrganization'
}
