import type { OrganizationDomain } from '@rpg/contracts'

export type EditOrganizationMembershipOrganization = {
  id: string
  name: string
  organizationDomain: OrganizationDomain
  organizationForm?: string
}

/** Surface-facing wording — the drawer body, save flow, and remove flow are shared. */
export type EditOrganizationMembershipDrawerCopy = {
  drawerTitle: string
  removeLabel: string
  removeConfirmDescription: string
}

/** Character-sheet wording — the membership is owned by the sheet, so removal reads sheet-first. */
export const CHARACTER_SHEET_EDIT_MEMBERSHIP_COPY: EditOrganizationMembershipDrawerCopy = {
  drawerTitle: 'Edit organization membership',
  removeLabel: 'Remove organization',
  removeConfirmDescription: 'This removes the organization membership from the character sheet.',
}

/** Shared removal headline so both membership surfaces confirm with identical wording. */
export function formatRemoveMembershipHeadline(
  characterName: string,
  organizationName: string,
): string {
  return `Remove ${characterName} from ${organizationName}?`
}

export type EditOrganizationMembershipDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  organization: EditOrganizationMembershipOrganization
  characterName: string
  currentTitle?: string
  copy?: EditOrganizationMembershipDrawerCopy
  onSave: (title?: string) => Promise<void>
  onRemove: () => Promise<void>
}
