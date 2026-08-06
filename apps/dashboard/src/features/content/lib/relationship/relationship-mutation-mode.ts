/**
 * Explicit mutation boundaries for cross-content relationship drawers.
 * The action that opens the drawer determines which endpoints are mutable.
 */
export type RelationshipMutationMode = 'add' | 'changeKind' | 'replaceSubject' | 'remove'

export type OrganizationInverseDrawerMode = 'add' | 'changeKind' | 'replaceOrganization'

export function isRelationshipKindMutationMode(
  mode: RelationshipMutationMode | OrganizationInverseDrawerMode,
): mode is 'changeKind' {
  return mode === 'changeKind'
}

export function isRelationshipSubjectMutationMode(
  mode: RelationshipMutationMode | OrganizationInverseDrawerMode,
): mode is 'replaceSubject' | 'replaceOrganization' {
  return mode === 'replaceSubject' || mode === 'replaceOrganization'
}
