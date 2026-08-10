import type { EditOrganizationMembershipDrawerCopy } from '@/features/character'

/**
 * Roster page cap — the organization detail fetches a single page. Rosters larger
 * than this render an overflow note (`formatOrganizationMembersOverflow`) instead
 * of silently truncating.
 */
export const ORGANIZATION_MEMBERS_PAGE_SIZE = 50

/** Overflow note when the roster exceeds the fetched page. */
export function formatOrganizationMembersOverflow(shown: number, total: number): string {
  return `Showing ${shown} of ${total} members.`
}

export const ORGANIZATION_MEMBERS_LOAD_ERROR = 'Could not load members for this organization.'

export const ORGANIZATION_MEMBER_ADD_FAILED = 'Could not add this member.'

export const ORGANIZATION_MEMBERS_MUTATION_ERROR = 'Could not update members for this organization.'

export const ORGANIZATION_MEMBERS_ADD_LABEL = 'Add member'
export const ORGANIZATION_MEMBER_EDIT_LABEL = 'Edit membership'
export const ORGANIZATION_MEMBER_REMOVE_LABEL = 'Remove member'

/** Organization-facing wording for the shared membership editor drawer and remove confirm. */
export const ORGANIZATION_ROSTER_EDIT_MEMBERSHIP_COPY: EditOrganizationMembershipDrawerCopy = {
  drawerTitle: ORGANIZATION_MEMBER_EDIT_LABEL,
  removeLabel: ORGANIZATION_MEMBER_REMOVE_LABEL,
  removeConfirmDescription:
    'This removes the membership from this organization roster and the character sheet.',
}
