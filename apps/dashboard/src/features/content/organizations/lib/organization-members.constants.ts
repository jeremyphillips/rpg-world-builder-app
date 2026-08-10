import type { EditOrganizationMembershipDrawerCopy } from '@/features/character'

/** Organization detail reads the full roster, not a truncated preview. */
export const ORGANIZATION_MEMBERS_PAGE_SIZE = 50

export const ORGANIZATION_MEMBERS_LOAD_ERROR = 'Could not load members for this organization.'

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
